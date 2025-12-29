import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../auth/auth';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { MASSAGE_SERVICES, calculateTaxes, getMassagePrice } from '../../config/massages';

// Schéma de validation pour créer un reçu
const createReceiptSchema = z.object({
  clientId: z.string().min(1, 'L\'ID du client est requis'),
  noteId: z.string().optional(), // Optionnel - lien vers une note si existante
  serviceId: z.string().optional(),
  serviceName: z.string().min(1, 'Le nom du service est requis'),
  duration: z.number().int().min(1, 'La durée est requise (50, 60 ou 80 minutes)'),
  treatmentDate: z.string().min(1, 'La date du traitement est requise'),
  treatmentTime: z.string().min(1, 'L\'heure du traitement est requise'),
});

/**
 * Génère un numéro de reçu unique par thérapeute
 * Chaque thérapeute a son propre compteur qui commence à 1
 */
const generateReceiptNumber = async (therapistId: string): Promise<number> => {
  // Trouver le dernier reçu du thérapeute
  const lastReceipt = await prisma.receipt.findFirst({
    where: {
      therapistId,
    },
    orderBy: {
      receiptNumber: 'desc',
    },
  });

  // Si le thérapeute n'a jamais créé de reçu, commencer à 1
  if (!lastReceipt) {
    return 1;
  }

  // Sinon, incrémenter le dernier numéro
  return lastReceipt.receiptNumber + 1;
};

/**
 * Génère un PDF pour un reçu d'assurance
 * @param receipt Les données du reçu
 * @returns Buffer du PDF généré
 */
const generateReceiptPDF = (receipt: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Charger la police de signature personnalisée
      doc.registerFont('Signature', 'src/fonts/GreatVibes-Regular.ttf');

      const pageWidth = 595; // A4 width in points
      const pageHeight = 842; // A4 height in points
      const leftMargin = 40;
      const rightMargin = pageWidth - 40;

      // ===================================
      // FILIGRANE - Logo au centre en fond (plus petit et discret)
      // ===================================
      try {
        const logoPath = 'src/utils/logo_spa.png';
        const watermarkSize = 350;
        const watermarkX = (pageWidth - watermarkSize) / 2;
        const watermarkY = (pageHeight - watermarkSize) / 2;

        doc.save();
        doc.opacity(0.12); // Très transparent pour le filigrane
        doc.image(logoPath, watermarkX, watermarkY, {
          width: watermarkSize,
          align: 'center',
        });
         doc.restore();
        doc.opacity(1); // Retour à l'opacité normale
      } catch (error) {
        console.error('Erreur lors du chargement du logo filigrane:', error);
      }

      // ===================================
      // EN-TÊTE - Version compacte
      // ===================================
      let currentY = 40;

      // **Bordure décorative en haut**
      doc
        .rect(leftMargin, currentY - 5, pageWidth - 80, 2)
        .fillAndStroke('#2c5f2d', '#2c5f2d');

      currentY += 8;

      // **EN-TÊTE GAUCHE** - Informations du thérapeute (compact)
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#2c5f2d')
        .text(`${receipt.therapistName} – ${receipt.roleLabel}`, leftMargin, currentY)
        .fillColor('#333')
        .font('Helvetica')
        .fontSize(8)
        .text(receipt.spaAddress, leftMargin, currentY + 13)
        .text(`Tél: ${receipt.spaPhone}`, leftMargin, currentY + 24)
        .fontSize(10)
        .text(`N° de membre: ${receipt.numeroOrdre}`, leftMargin, currentY + 37);

      // **EN-TÊTE DROITE** - Logo du spa (plus petit)
      try {
        const logoPath = 'src/utils/logo_spa.png';
        doc.image(logoPath, rightMargin - 100, currentY, {
          width: 100,
          align: 'right',
        });
      } catch (error) {
        console.error('Erreur lors du chargement du logo en-tête:', error);
      }

      currentY = 100;

      // **TITRE** - Reçu d'assurance avec fond coloré (compact)
      doc
        .rect(leftMargin, currentY, pageWidth - 80, 25)
        .fillAndStroke('#f0f8f0', '#2c5f2d');

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#2c5f2d')
        .text('REÇU D\'ASSURANCE', leftMargin, currentY + 6, {
          align: 'center',
          width: pageWidth - 80,
        });

      currentY += 35;

      // **NUMÉRO DE REÇU** - Badge style (compact)
      doc
        .roundedRect(leftMargin, currentY, 100, 20, 3)
        .fillAndStroke('#2c5f2d', '#2c5f2d');

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#fff')
        .text(`Reçu N° ${receipt.receiptNumber}`, leftMargin + 8, currentY + 5);

      currentY += 30;

      // Ligne de séparation élégante
      doc
        .moveTo(leftMargin, currentY)
        .lineTo(rightMargin, currentY)
        .lineWidth(1.5)
        .strokeColor('#2c5f2d')
        .stroke();

      currentY += 15;

      // ===================================
      // SECTION FACTURATION
      // ===================================
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#2c5f2d')
        .text('FACTURÉ À', leftMargin, currentY);

      currentY += 12;

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#333')
        .text(receipt.clientName, leftMargin + 10, currentY);

      currentY += 20;

      // ===================================
      // DÉTAILS DU RENDEZ-VOUS - Encadré (compact)
      // ===================================
      doc
        .roundedRect(leftMargin, currentY, pageWidth - 80, 65, 5)
        .lineWidth(1)
        .strokeColor('#2c5f2d')
        .stroke();

      currentY += 10;

      // Date
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#2c5f2d')
        .text('Date du rendez-vous:', leftMargin + 10, currentY)
        .font('Helvetica')
        .fillColor('#333')
        .text(new Date(receipt.treatmentDate).toLocaleDateString('fr-CA'), leftMargin + 130, currentY);

      currentY += 14;

      // Heure
      doc
        .font('Helvetica-Bold')
        .fillColor('#2c5f2d')
        .text('Heure du rendez-vous:', leftMargin + 10, currentY)
        .font('Helvetica')
        .fillColor('#333')
        .text(receipt.treatmentTime, leftMargin + 130, currentY);

      currentY += 14;

      // Service
      doc
        .font('Helvetica-Bold')
        .fillColor('#2c5f2d')
        .text('Service:', leftMargin + 10, currentY)
        .font('Helvetica')
        .fillColor('#333')
        .text(`${receipt.serviceName}`, leftMargin + 130, currentY);

      currentY += 14;

      // Durée
      doc
        .font('Helvetica-Bold')
        .fillColor('#2c5f2d')
        .text('Durée:', leftMargin + 10, currentY)
        .font('Helvetica')
        .fillColor('#333')
        .text(`${receipt.duration} minutes`, leftMargin + 130, currentY);

      currentY += 22;

      // ===================================
      // MONTANT - Encadré avec détails des taxes (compact)
      // ===================================
      doc
        .roundedRect(leftMargin, currentY, pageWidth - 80, 80, 5)
        .lineWidth(1)
        .strokeColor('#2c5f2d')
        .stroke();

      currentY += 10;

      // Subtotal (avant taxes)
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#333')
        .text('Subtotal (avant taxes):', leftMargin + 10, currentY)
        .font('Helvetica-Bold')
        .text(`${parseFloat(receipt.subtotal.toString()).toFixed(2)} $`, rightMargin -100, currentY, { align: 'right' });

      currentY += 14;

      // TPS (5%)
      doc
        .font('Helvetica')
        .fillColor('#333')
        .text('TPS (5%):', leftMargin + 10, currentY)
        .font('Helvetica-Bold')
        .text(`${parseFloat(receipt.taxTPS.toString()).toFixed(2)} $`, rightMargin - 100, currentY, { align: 'right' });

      currentY += 14;

      // TVQ (9.975%)
      doc
        .font('Helvetica')
        .fillColor('#333')
        .text('TVQ (9.975%):', leftMargin + 10, currentY)
        .font('Helvetica-Bold')
        .text(`${parseFloat(receipt.taxTVQ.toString()).toFixed(2)} $`, rightMargin - 100, currentY, { align: 'right' });

      currentY += 15;

      // Ligne de séparation avant le total
      doc
        .moveTo(leftMargin + 10, currentY)
        .lineTo(rightMargin - 10, currentY)
        .lineWidth(1)
        .strokeColor('#2c5f2d')
        .stroke();

      currentY += 10;

      // Total avec taxes
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#2c5f2d')
        .text('MONTANT TOTAL:', leftMargin + 10, currentY)
        .fontSize(12)
        .text(`${parseFloat(receipt.total.toString()).toFixed(2)} $ CAD`, rightMargin - 120, currentY);

      currentY += 60;

      // ===================================
      // SIGNATURE DU THÉRAPEUTE (À DROITE) + NOM (À GAUCHE)
      // ===================================
      const signatureY = currentY; // Position de départ pour alignement

      // **GAUCHE** - Nom et titre du thérapeute
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#666')
        .text('Nom du thérapeute', leftMargin, signatureY, { align: 'left' });

      const therapistTitle = receipt.titreProfessionnel
        ? `${receipt.therapistName}\n${receipt.roleLabel} ${receipt.titreProfessionnel}`
        : `${receipt.therapistName}\n${receipt.roleLabel}`;

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#2c5f2d')
        .text(therapistTitle, leftMargin, signatureY + 12, { align: 'left' });

      // **DROITE** - Signature du thérapeute
      const signatureRightX = rightMargin - 150; // Position à droite

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#666')
        .text('Signature du thérapeute', signatureRightX, signatureY, { align: 'left', width: 150 });

      // Afficher l'image de signature si elle existe, sinon signature typographique
      if (receipt.signatureUrl) {
        try {
          // Afficher l'image de signature à droite
          doc.image(receipt.signatureUrl, signatureRightX, signatureY + 12, {
            width: 120,
            height: 40,
            fit: [120, 40],
          });
        } catch (error) {
          console.error('Erreur lors du chargement de la signature:', error);
          // Si erreur, afficher la signature typographique à droite
          doc
            .fontSize(24)
            .font('Signature')
            .fillColor('#000000')
            .text(receipt.therapistName, signatureRightX, signatureY + 8, { width: 150 });

          doc
            .fontSize(7)
            .font('Helvetica-Oblique')
            .fillColor('#666')
            .text('(Signature électronique)', signatureRightX, signatureY + 38, { width: 150 });
        }
      } else {
        // Signature typographique à droite (nom en cursive + mention électronique)
        doc
          .fontSize(24)
          .font('Signature')
          .fillColor('#000000')
          .text(receipt.therapistName, signatureRightX, signatureY + 8, { width: 150 });

        doc
          .fontSize(7)
          .font('Helvetica-Oblique')
          .fillColor('#666')
          .text('(Signature électronique)', signatureRightX, signatureY + 38, { width: 150 });
      }

      currentY = signatureY + 70; // Avancer après la section signature

      // ===================================
      // PIED DE PAGE
      // ===================================
      // Bordure décorative en bas
      doc
        .rect(leftMargin, currentY, pageWidth - 80, 2)
        .fillAndStroke('#2c5f2d', '#2c5f2d');

      doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor('#666')
        .text(
          'Ce reçu est valide pour les réclamations d\'assurance. Veuillez le conserver pour vos dossiers.',
          leftMargin,
          currentY + 8,
          { align: 'center', width: pageWidth - 80 }
        )
        .fontSize(6)
        .fillColor('#999')
        .text(
          `Document généré le ${new Date().toLocaleDateString('fr-CA')}`,
          leftMargin,
          currentY + 22,
          { align: 'center', width: pageWidth - 80 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Envoie le reçu par email au client
 * @param clientEmail Email du client
 * @param clientName Nom du client
 * @param receiptNumber Numéro du reçu
 * @param pdfBuffer Buffer du PDF
 * @param receiptDetails Détails du reçu (service, montant, date)
 */
const sendReceiptEmail = async (
  clientEmail: string,
  clientName: string,
  receiptNumber: number,
  pdfBuffer: Buffer,
  receiptDetails: {
    serviceName: string;
    duration: number;
    total: number;
    treatmentDate: Date;
    treatmentTime: string;
    therapistName: string;
  }
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Formater la date en français
  const formattedDate = new Date(receiptDetails.treatmentDate).toLocaleDateString('fr-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@sparenaissance.ca',
    to: clientEmail,
    subject: `Reçu d'assurance N° ${receiptNumber} - Spa Renaissance`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>

      <body style="
        margin:0;
        padding:0;
        background-color:#ffffff;
        font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        color:#1a1a1a;
        line-height:1.65;
      ">

      <div style="max-width:600px;margin:0 auto;padding:16px 14px 8px;">

        <!-- Logo -->
        <div style="text-align:center;margin-bottom:14px;">
          <img
            src="https://www.sparenaissance.ca/wp-content/uploads/2022/11/logo_spa_renaissance_2022_footer.png"
            alt="Spa Renaissance"
            style="max-width:120px;height:auto;"
          />
        </div>

        <!-- Nom -->
        <div style="
          text-align:center;
          font-size:18px;
          font-weight:500;
          color:#2c5f2d;
          margin-bottom:18px;
        ">
          Spa Renaissance
        </div>

        <!-- Message -->
        <div style="font-size:15px;">
          <div style="
            text-align:center;
            font-size:20px;
            font-weight:600;
            color:#2c5f2d;
            margin-bottom:18px;
          ">
            Reçu d'assurance
          </div>

          <p><strong>Bonjour ${clientName},</strong></p>

          <p>
            Nous vous remercions d'avoir choisi le Spa Renaissance pour votre soin de bien-être.
            Veuillez trouver ci-joint votre reçu d'assurance officiel.
          </p>

          <!-- Détails du reçu -->
          <p style="margin-top:24px;margin-bottom:12px;font-weight:600;color:#2c5f2d;font-size:16px;">
            Détails du reçu
          </p>

          <div style="margin:8px 0;padding:10px 0;border-bottom:1px solid #eaeaea;">
            <span style="font-weight:600;color:#666;">Numéro de reçu:</span>
            <span style="color:#1a1a1a;"> N° ${receiptNumber}</span>
          </div>

          <div style="margin:8px 0;padding:10px 0;border-bottom:1px solid #eaeaea;">
            <span style="font-weight:600;color:#666;">Thérapeute:</span>
            <span style="color:#1a1a1a;"> ${receiptDetails.therapistName}</span>
          </div>

          <div style="margin:8px 0;padding:10px 0;border-bottom:1px solid #eaeaea;">
            <span style="font-weight:600;color:#666;">Service:</span>
            <span style="color:#1a1a1a;"> ${receiptDetails.serviceName}</span>
          </div>

          <div style="margin:8px 0;padding:10px 0;border-bottom:1px solid #eaeaea;">
            <span style="font-weight:600;color:#666;">Durée:</span>
            <span style="color:#1a1a1a;"> ${receiptDetails.duration} minutes</span>
          </div>

          <div style="margin:8px 0;padding:10px 0;border-bottom:1px solid #eaeaea;">
            <span style="font-weight:600;color:#666;">Date du traitement:</span>
            <span style="color:#1a1a1a;"> ${formattedDate}</span>
          </div>

          <div style="margin:8px 0;padding:10px 0;border-bottom:1px solid #eaeaea;">
            <span style="font-weight:600;color:#666;">Heure:</span>
            <span style="color:#1a1a1a;"> ${receiptDetails.treatmentTime}</span>
          </div>

          <div style="margin:24px 0;padding:16px 0;border-top:2px solid #2c5f2d;border-bottom:2px solid #2c5f2d;text-align:center;">
            <p style="margin:0 0 8px 0;font-size:14px;color:#666;">Montant total (taxes incluses)</p>
            <div style="font-size:28px;font-weight:600;color:#2c5f2d;">${receiptDetails.total.toFixed(2)} $ CAD</div>
          </div>

          <p style="margin-top:24px;margin-bottom:8px;font-weight:600;color:#2c5f2d;">
            Informations importantes
          </p>

          <ul style="margin:8px 0;padding-left:20px;line-height:1.8;">
            <li>Ce reçu est <strong>valide pour les réclamations d'assurance</strong></li>
            <li>Conservez-le précieusement pour vos dossiers</li>
            <li>Le document PDF ci-joint est le reçu officiel avec signature</li>
          </ul>

          <p>
            Si vous avez des questions concernant ce reçu ou votre traitement,
            n'hésitez pas à nous contacter. Il nous fera plaisir de vous aider.
          </p>

          <p style="margin-top:25px;">
            Merci de votre confiance,<br>
            <strong>L'équipe du Spa Renaissance</strong>
          </p>
        </div>

        <!-- Séparateur -->
        <div style="height:1px;background:#eaeaea;margin:22px 0;"></div>

        <!-- Footer -->
        <div style="
          text-align:center;
          font-size:12px;
          color:#666;
          line-height:1.5;
        ">
          <div style="font-weight:600;color:#2c5f2d;">Spa Renaissance</div>
          <div>451 avenue Arnaud, suite 101, Sept-Îles, Québec G4R 3B3</div>
          <div style="margin-top:6px;">info@sparenaissance.ca • 418-968-0606</div>
          <div style="margin-top:6px;color:#999;font-size:11px;">
            © ${new Date().getFullYear()} Spa Renaissance - Tous droits réservés
          </div>
          <div style="margin-top:10px;font-size:11px;color:#999;">
            Ce courriel a été envoyé automatiquement, merci de ne pas y répondre.
          </div>
        </div>

      </div>

      </body>
      </html>
    `,
    attachments: [
      {
        filename: `Recu_Assurance_${receiptNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  console.log(`📧 Envoi du reçu N° ${receiptNumber} à ${clientEmail}...`);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé avec succès! Message ID: ${info.messageId}`);
    console.log(`📬 Destinataire: ${clientEmail}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

/**
 * @desc    Créer un reçu et l'envoyer au client (après prévisualisation)
 * @route   POST /api/receipts/send
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export const createAndSendReceipt = async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  // Vérifier que l'utilisateur est un massothérapeute, esthéticienne ou admin
  if (
    user.role !== 'MASSOTHERAPEUTE' &&
    user.role !== 'ESTHETICIENNE' &&
    user.role !== 'ADMIN'
  ) {
    throw new AppError('Accès refusé. Seuls les thérapeutes peuvent créer des reçus.', 403);
  }

  // Validation des données
  const validatedData = createReceiptSchema.parse(req.body);

  // Récupérer les informations du client
  const client = await prisma.clientProfile.findUnique({
    where: { id: validatedData.clientId },
  });

  if (!client) {
    throw new AppError('Client non trouvé', 404);
  }

  // Récupérer les informations complètes du thérapeute connecté
  const therapist = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!therapist) {
    throw new AppError('Thérapeute non trouvé', 404);
  }

  // Vérifier que le thérapeute a un numéro d'ordre
  if (!therapist.numeroOrdre) {
    throw new AppError(
      'Vous devez avoir un numéro d\'ordre professionnel pour émettre des reçus. Veuillez contacter l\'administrateur.',
      400
    );
  }

  // Si une note est fournie, vérifier qu'un reçu n'existe pas déjà pour cette note
  if (validatedData.noteId) {
    const existingReceipt = await prisma.receipt.findUnique({
      where: { noteId: validatedData.noteId },
    });

    if (existingReceipt) {
      throw new AppError('Un reçu existe déjà pour cette note', 400);
    }
  }

  // Générer un numéro de reçu unique par thérapeute
  const receiptNumber = await generateReceiptNumber(therapist.id);

  // Informations du spa
  const spaAddress = process.env.SPA_ADDRESS || '451 avenue Arnaud, suite 101, Sept-Îles, Québec G4R 3B3';
  const spaPhone = process.env.SPA_PHONE || '418-968-0606';

  // Récupérer le prix du massage et calculer les taxes
  const subtotal = getMassagePrice(validatedData.serviceName, validatedData.duration);

  if (subtotal === null) {
    throw new AppError(
      `Prix non trouvé pour le massage "${validatedData.serviceName}" avec une durée de ${validatedData.duration} minutes.`,
      400
    );
  }

  const taxes = calculateTaxes(subtotal);

  // Déterminer le label du rôle
  const roleLabels: Record<string, string> = {
    MASSOTHERAPEUTE: 'Massothérapeute',
    ESTHETICIENNE: 'Esthéticienne',
    SECRETAIRE: 'Secrétaire',
    ADMIN: 'Administrateur',
  };

  const roleLabel = roleLabels[therapist.role] || 'Thérapeute';

  // Créer le reçu en base de données
  const receiptData: any = {
    receiptNumber,
    clientId: validatedData.clientId,
    clientName: `${client.prenom} ${client.nom}`,
    clientEmail: client.courriel,
    therapistId: therapist.id,
    therapistName: `${therapist.prenom} ${therapist.nom}`,
    numeroOrdre: therapist.numeroOrdre,
    serviceName: validatedData.serviceName,
    duration: validatedData.duration,
    subtotal: taxes.subtotal,
    taxTPS: taxes.tps,
    taxTVQ: taxes.tvq,
    total: taxes.total,
    spaAddress,
    spaPhone,
    treatmentDate: new Date(validatedData.treatmentDate),
    treatmentTime: validatedData.treatmentTime,
    emailSent: false,
  };

  // Ajouter les champs optionnels seulement s'ils existent et ne sont pas vides
  if (validatedData.noteId && validatedData.noteId.trim() !== '') {
    receiptData.noteId = validatedData.noteId;
  }

  // Vérifier que le service existe avant de l'ajouter
  if (validatedData.serviceId && validatedData.serviceId.trim() !== '') {
    const serviceExists = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    });

    if (serviceExists) {
      receiptData.serviceId = validatedData.serviceId;
    }
    // Si le service n'existe pas, on ne l'ajoute simplement pas (le champ est optionnel)
  }

  const receipt = await prisma.receipt.create({
    data: receiptData,
  });

  // Enrichir le reçu pour le PDF
  const receiptForPDF = {
    ...receipt,
    titreProfessionnel: therapist.titreProfessionnel,
    roleLabel: roleLabel,
    signatureUrl: therapist.signatureUrl, // Signature du thérapeute
  };

  // Générer le PDF
  const pdfBuffer = await generateReceiptPDF(receiptForPDF);

  // Envoyer le reçu par email au client
  try {
    await sendReceiptEmail(
      client.courriel,
      `${client.prenom} ${client.nom}`,
      receiptNumber,
      pdfBuffer,
      {
        serviceName: receipt.serviceName,
        duration: receipt.duration,
        total: receipt.total,
        treatmentDate: receipt.treatmentDate,
        treatmentTime: receipt.treatmentTime,
        therapistName: `${therapist.prenom} ${therapist.nom}`,
      }
    );

    // Marquer le reçu comme envoyé
    await prisma.receipt.update({
      where: { id: receipt.id },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Reçu créé et envoyé au client avec succès',
      data: {
        id: receipt.id,
        receiptNumber: receipt.receiptNumber,
        clientName: receipt.clientName,
        serviceName: receipt.serviceName,
        total: receipt.total,
        emailSent: true,
        emailSentAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new AppError('Le reçu a été créé mais l\'email n\'a pas pu être envoyé. Veuillez réessayer.', 500);
  }
};

/**
 * @desc    Créer un reçu d'assurance et l'envoyer au client (OLD - conservé pour rétrocompatibilité)
 * @route   POST /api/receipts
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export const createReceipt = async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  // Vérifier que l'utilisateur est un massothérapeute, esthéticienne ou admin
  if (
    user.role !== 'MASSOTHERAPEUTE' &&
    user.role !== 'ESTHETICIENNE' &&
    user.role !== 'ADMIN'
  ) {
    throw new AppError('Accès refusé. Seuls les thérapeutes peuvent créer des reçus.', 403);
  }

  // Validation des données
  const validatedData = createReceiptSchema.parse(req.body);

  // Récupérer les informations du client
  const client = await prisma.clientProfile.findUnique({
    where: { id: validatedData.clientId },
  });

  if (!client) {
    throw new AppError('Client non trouvé', 404);
  }

  // Récupérer les informations complètes du thérapeute connecté
  const therapist = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!therapist) {
    throw new AppError('Thérapeute non trouvé', 404);
  }

  // Vérifier que le thérapeute a un numéro d'ordre
  if (!therapist.numeroOrdre) {
    throw new AppError(
      'Vous devez avoir un numéro d\'ordre professionnel pour émettre des reçus. Veuillez contacter l\'administrateur.',
      400
    );
  }

  // Si une note est fournie, vérifier qu'un reçu n'existe pas déjà pour cette note
  if (validatedData.noteId) {
    const existingReceipt = await prisma.receipt.findUnique({
      where: { noteId: validatedData.noteId },
    });

    if (existingReceipt) {
      throw new AppError('Un reçu existe déjà pour cette note', 400);
    }
  }

  // Générer un numéro de reçu unique par thérapeute
  const receiptNumber = await generateReceiptNumber(therapist.id);

  // Informations du spa (à configurer dans les variables d'environnement)
  const spaAddress = process.env.SPA_ADDRESS || '451 avenue Arnaud, suite 101, Sept-Îles, Québec G4R 3B3';
  const spaPhone = process.env.SPA_PHONE || '418-968-0606';

  // Récupérer le prix du massage en fonction du nom et de la durée (prix AVANT taxes)
  const subtotal = getMassagePrice(validatedData.serviceName, validatedData.duration);

  if (subtotal === null) {
    throw new AppError(
      `Prix non trouvé pour le massage "${validatedData.serviceName}" avec une durée de ${validatedData.duration} minutes. Veuillez vérifier le nom du service et la durée.`,
      400
    );
  }

  // Calculer les taxes (TPS 5% + TVQ 9.975%) et le total
  const taxes = calculateTaxes(subtotal);

  // Déterminer le label du rôle en français
  const roleLabels: Record<string, string> = {
    MASSOTHERAPEUTE: 'Massothérapeute',
    ESTHETICIENNE: 'Esthéticienne',
    SECRETAIRE: 'Secrétaire',
    ADMIN: 'Administrateur',
  };

  const roleLabel = roleLabels[therapist.role] || 'Thérapeute';

  // Vérifier que le service existe si un serviceId est fourni
  let validServiceId = undefined;
  if (validatedData.serviceId && validatedData.serviceId.trim() !== '') {
    const serviceExists = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    });
    if (serviceExists) {
      validServiceId = validatedData.serviceId;
    }
  }

  // Créer le reçu
  const receipt = await prisma.receipt.create({
    data: {
      receiptNumber,
      clientId: validatedData.clientId,
      noteId: validatedData.noteId, // Optionnel
      clientName: `${client.prenom} ${client.nom}`,
      clientEmail: client.courriel,
      therapistId: therapist.id,
      therapistName: `${therapist.prenom} ${therapist.nom}`,
      numeroOrdre: therapist.numeroOrdre,
      serviceId: validServiceId,
      serviceName: validatedData.serviceName,
      duration: validatedData.duration,
      subtotal: taxes.subtotal,
      taxTPS: taxes.tps,
      taxTVQ: taxes.tvq,
      total: taxes.total,
      spaAddress,
      spaPhone,
      treatmentDate: new Date(validatedData.treatmentDate),
      treatmentTime: validatedData.treatmentTime,
    },
  });

  // Enrichir le reçu avec les informations pour le PDF
  const receiptForPDF = {
    ...receipt,
    titreProfessionnel: therapist.titreProfessionnel,
    roleLabel: roleLabel,
    signatureUrl: therapist.signatureUrl, // Signature du thérapeute
  };

  // Générer le PDF
  const pdfBuffer = await generateReceiptPDF(receiptForPDF);

  // Envoyer le reçu par email au client (sans que le thérapeute voie l'email)
  try {
    await sendReceiptEmail(
      client.courriel,
      `${client.prenom} ${client.nom}`,
      receiptNumber,
      pdfBuffer,
      {
        serviceName: receipt.serviceName,
        duration: receipt.duration,
        total: receipt.total,
        treatmentDate: receipt.treatmentDate,
        treatmentTime: receipt.treatmentTime,
        therapistName: `${therapist.prenom} ${therapist.nom}`,
      }
    );

    // Marquer le reçu comme envoyé
    await prisma.receipt.update({
      where: { id: receipt.id },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new AppError('Le reçu a été créé mais l\'email n\'a pas pu être envoyé. Veuillez réessayer.', 500);
  }

  // Retourner le reçu SANS l'email du client (protection de la vie privée)
  const { clientEmail, ...receiptWithoutEmail } = receipt;

  res.status(201).json({
    success: true,
    message: 'Reçu créé et envoyé au client avec succès',
    data: {
      ...receiptWithoutEmail,
      clientEmail: '***@***.***', // Masquer l'email pour le thérapeute
    },
  });
};

/**
 * @desc    Récupérer tous les reçus créés par un thérapeute
 * @route   GET /api/receipts
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export const getReceipts = async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  let where: any = {};

  // Filtrer par thérapeute sauf pour les ADMIN
  if (user.role !== 'ADMIN') {
    where.therapistId = user.id;
  }

  const receipts = await prisma.receipt.findMany({
    where,
    include: {
      note: {
        select: {
          id: true,
          createdAt: true,
        },
      },
      therapist: {
        select: {
          id: true,
          nom: true,
          prenom: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Masquer les emails des clients pour les non-ADMIN
  const receiptsWithPrivacy = receipts.map(receipt => {
    if (user.role === 'ADMIN') {
      return receipt;
    }

    const { clientEmail, ...receiptWithoutEmail } = receipt;
    return {
      ...receiptWithoutEmail,
      clientEmail: '***@***.***',
    };
  });

  res.status(200).json({
    success: true,
    data: receiptsWithPrivacy,
  });
};

/**
 * @desc    Récupérer un reçu par ID
 * @route   GET /api/receipts/:id
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export const getReceiptById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: {
      note: {
        select: {
          id: true,
          createdAt: true,
        },
      },
      therapist: {
        select: {
          id: true,
          nom: true,
          prenom: true,
        },
      },
    },
  });

  if (!receipt) {
    throw new AppError('Reçu non trouvé', 404);
  }

  // Vérifier les permissions (non-ADMIN ne peuvent voir que leurs propres reçus)
  if (user.role !== 'ADMIN' && receipt.therapistId !== user.id) {
    throw new AppError('Vous n\'avez pas accès à ce reçu', 403);
  }

  // Masquer l'email du client pour les non-ADMIN
  if (user.role !== 'ADMIN') {
    const { clientEmail, ...receiptWithoutEmail } = receipt;
    return res.status(200).json({
      success: true,
      data: {
        ...receiptWithoutEmail,
        clientEmail: '***@***.***',
      },
    });
  }

  res.status(200).json({
    success: true,
    data: receipt,
  });
};

/**
 * @desc    Renvoyer un reçu par email
 * @route   POST /api/receipts/:id/resend
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export const resendReceipt = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: {
      therapist: {
        select: {
          nom: true,
          prenom: true,
          role: true,
          titreProfessionnel: true,
          signatureUrl: true,
        },
      },
    },
  });

  if (!receipt) {
    throw new AppError('Reçu non trouvé', 404);
  }

  // Vérifier les permissions
  if (user.role !== 'ADMIN' && receipt.therapistId !== user.id) {
    throw new AppError('Vous n\'avez pas accès à ce reçu', 403);
  }

  // Déterminer le label du rôle en français
  const roleLabels: Record<string, string> = {
    MASSOTHERAPEUTE: 'Massothérapeute',
    ESTHETICIENNE: 'Esthéticienne',
    SECRETAIRE: 'Secrétaire',
    ADMIN: 'Administrateur',
  };

  const roleLabel = roleLabels[receipt.therapist.role] || 'Thérapeute';

  // Enrichir le reçu avec les informations pour le PDF
  const receiptForPDF = {
    ...receipt,
    therapistName: `${receipt.therapist.prenom} ${receipt.therapist.nom}`,
    titreProfessionnel: receipt.therapist.titreProfessionnel,
    roleLabel: roleLabel,
    signatureUrl: receipt.therapist.signatureUrl, // Signature du thérapeute
  };

  // Régénérer le PDF
  const pdfBuffer = await generateReceiptPDF(receiptForPDF);

  // Renvoyer l'email
  try {
    await sendReceiptEmail(
      receipt.clientEmail,
      receipt.clientName,
      receipt.receiptNumber,
      pdfBuffer,
      {
        serviceName: receipt.serviceName,
        duration: receipt.duration,
        total: receipt.total,
        treatmentDate: receipt.treatmentDate,
        treatmentTime: receipt.treatmentTime,
        therapistName: receipt.therapistName,
      }
    );

    // Mettre à jour la date d'envoi
    await prisma.receipt.update({
      where: { id },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Reçu renvoyé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email:', error);
    throw new AppError('Impossible de renvoyer le reçu. Veuillez réessayer.', 500);
  }
};

/**
 * @desc    Récupérer la liste des services de massage avec leurs prix
 * @route   GET /api/receipts/massage-services
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export const getMassageServices = async (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    data: MASSAGE_SERVICES,
  });
};

/**
 * @desc    Générer un aperçu du reçu PDF sans le sauvegarder ni l'envoyer
 * @route   POST /api/receipts/preview
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export const previewReceipt = async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  // Vérifier que l'utilisateur est un massothérapeute, esthéticienne ou admin
  if (
    user.role !== 'MASSOTHERAPEUTE' &&
    user.role !== 'ESTHETICIENNE' &&
    user.role !== 'ADMIN'
  ) {
    throw new AppError('Accès refusé. Seuls les thérapeutes peuvent créer des reçus.', 403);
  }

  // Validation des données
  const validatedData = createReceiptSchema.parse(req.body);

  // Récupérer les informations du client
  const client = await prisma.clientProfile.findUnique({
    where: { id: validatedData.clientId },
  });

  if (!client) {
    throw new AppError('Client non trouvé', 404);
  }

  // Récupérer les informations complètes du thérapeute connecté
  const therapist = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!therapist) {
    throw new AppError('Thérapeute non trouvé', 404);
  }

  // Vérifier que le thérapeute a un numéro d'ordre
  if (!therapist.numeroOrdre) {
    throw new AppError(
      'Vous devez avoir un numéro d\'ordre professionnel pour émettre des reçus. Veuillez contacter l\'administrateur.',
      400
    );
  }

  // Générer un numéro de reçu temporaire (sera le prochain numéro)
  const nextReceiptNumber = await generateReceiptNumber(therapist.id);

  // Informations du spa
  const spaAddress = process.env.SPA_ADDRESS || '451 avenue Arnaud, suite 101, Sept-Îles, Québec G4R 3B3';
  const spaPhone = process.env.SPA_PHONE || '418-968-0606';

  // Récupérer le prix du massage et calculer les taxes
  const subtotal = getMassagePrice(validatedData.serviceName, validatedData.duration);

  if (subtotal === null) {
    throw new AppError(
      `Prix non trouvé pour le massage "${validatedData.serviceName}" avec une durée de ${validatedData.duration} minutes. Veuillez vérifier le nom du service et la durée.`,
      400
    );
  }

  const taxes = calculateTaxes(subtotal);

  // Déterminer le label du rôle en français
  const roleLabels: Record<string, string> = {
    MASSOTHERAPEUTE: 'Massothérapeute',
    ESTHETICIENNE: 'Esthéticienne',
    SECRETAIRE: 'Secrétaire',
    ADMIN: 'Administrateur',
  };

  const roleLabel = roleLabels[therapist.role] || 'Thérapeute';

  // Créer un objet reçu temporaire pour l'aperçu (sans sauvegarder en base)
  const previewReceiptData = {
    receiptNumber: nextReceiptNumber,
    clientName: `${client.prenom} ${client.nom}`,
    therapistName: `${therapist.prenom} ${therapist.nom}`,
    numeroOrdre: therapist.numeroOrdre,
    serviceName: validatedData.serviceName,
    duration: validatedData.duration,
    subtotal: taxes.subtotal,
    taxTPS: taxes.tps,
    taxTVQ: taxes.tvq,
    total: taxes.total,
    spaAddress,
    spaPhone,
    treatmentDate: new Date(validatedData.treatmentDate),
    treatmentTime: validatedData.treatmentTime,
    titreProfessionnel: therapist.titreProfessionnel,
    roleLabel: roleLabel,
  };

  // Générer le PDF
  const pdfBuffer = await generateReceiptPDF(previewReceiptData);

  // Retourner le PDF en base64 pour affichage dans le frontend
  res.status(200).json({
    success: true,
    message: 'Aperçu du reçu généré avec succès',
    data: {
      pdf: pdfBuffer.toString('base64'),
      receiptNumber: nextReceiptNumber,
      subtotal: taxes.subtotal,
      taxTPS: taxes.tps,
      taxTVQ: taxes.tvq,
      total: taxes.total,
    },
  });
};

/**
 * @desc    Générer et afficher le PDF d'un reçu existant
 * @route   GET /api/receipts/:id/pdf
 * @access  Privé (MASSOTHERAPEUTE, ESTHETICIENNE, ADMIN)
 */
export const getReceiptPDF = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // Récupérer le reçu avec les informations du thérapeute
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: {
      therapist: {
        select: {
          nom: true,
          prenom: true,
          role: true,
          titreProfessionnel: true,
          signatureUrl: true,
        },
      },
    },
  });

  if (!receipt) {
    throw new AppError('Reçu non trouvé', 404);
  }

  // Vérifier les permissions (non-ADMIN ne peuvent voir que leurs propres reçus)
  if (user.role !== 'ADMIN' && receipt.therapistId !== user.id) {
    throw new AppError('Vous n\'avez pas accès à ce reçu', 403);
  }

  // Déterminer le label du rôle en français
  const roleLabels: Record<string, string> = {
    MASSOTHERAPEUTE: 'Massothérapeute',
    ESTHETICIENNE: 'Esthéticienne',
    SECRETAIRE: 'Secrétaire',
    ADMIN: 'Administrateur',
  };

  const roleLabel = roleLabels[receipt.therapist.role] || 'Thérapeute';

  // Enrichir le reçu avec les informations pour le PDF
  const receiptForPDF = {
    ...receipt,
    therapistName: `${receipt.therapist.prenom} ${receipt.therapist.nom}`,
    titreProfessionnel: receipt.therapist.titreProfessionnel,
    roleLabel: roleLabel,
    signatureUrl: receipt.therapist.signatureUrl, // Signature du thérapeute
  };

  // Générer le PDF
  const pdfBuffer = await generateReceiptPDF(receiptForPDF);

  // Retourner le PDF en base64 pour affichage dans le frontend
  res.status(200).json({
    success: true,
    message: 'PDF du reçu généré avec succès',
    data: {
      pdf: pdfBuffer.toString('base64'),
      receiptNumber: receipt.receiptNumber,
      clientName: receipt.clientName,
      serviceName: receipt.serviceName,
      total: receipt.total,
    },
  });
};
