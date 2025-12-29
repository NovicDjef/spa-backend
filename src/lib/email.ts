import nodemailer from 'nodemailer';

// Créer le transporteur
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Email de bienvenue pour les nouveaux clients
 */
export async function sendWelcomeEmail(
  email: string,
  prenom: string,
  serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE'
) {
  const serviceLabel =
    serviceType === 'MASSOTHERAPIE' ? 'massothérapie' : 'medico-Esthétique';

  const mailOptions = {
    from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Bienvenue au Spa Renaissance - Dossier créé avec succès',
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
          <p>Bonjour ${prenom},</p>

          <p>
            Merci d’avoir créé votre dossier client pour nos services de
            <strong>${serviceLabel}</strong>.
          </p>

          <p>
            <strong>Votre dossier a été créé avec succès.</strong><br />
            Notre équipe a bien reçu vos informations et les consultera avant votre rendez-vous.
          </p>

          <p>
            Un professionnel sera assigné à votre dossier selon votre type de service,
            dans le respect total de la confidentialité.
          </p>

          <p style="margin-top:14px;">
            <strong>Prochaines étapes :</strong>
          </p>

          <ul style="padding-left:18px;margin:8px 0;">
            <li>Votre dossier est enregistré et sécurisé</li>
            <li>Un professionnel sera assigné à votre suivi</li>
            <li>Vos informations demeurent strictement confidentielles</li>
          </ul>

          <p>
            Si vous avez des questions, notre équipe demeure disponible pour vous accompagner.
          </p>

          <p style="margin-top:16px;color:#2c5f2d;font-weight:600;">
            Au plaisir de prendre soin de vous.
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
          <div>info@sparenaissance.ca • 418-968-0606</div>
          <div style="margin-top:6px;color:#999;font-size:11px;">
            © ${new Date().getFullYear()} Spa Renaissance
          </div>
          <div style="margin-top:10px;font-size:11px;color:#999;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </div>
        </div>

      </div>

      </body>
      </html>
`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenue envoyé à ${email}`);
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    // Ne pas throw l'erreur pour ne pas bloquer la création du client
    // L'email est optionnel
  }
}

/**
 * Email marketing pour campagnes ADMIN
 */
export async function sendMarketingEmail(
  email: string,
  prenom: string,
  subject: string,
  message: string
) {
const mailOptions = {
  from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
  to: email,
  subject : subject,
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

<!-- Conteneur principal fluide -->
<div style="max-width:600px;margin:0 auto;padding:14px 14px 6px;">

  <!-- Logo -->
  <div style="text-align:center;margin-bottom:14px;">
    <img
      src="https://www.sparenaissance.ca/wp-content/uploads/2022/11/logo_spa_renaissance_2022_footer.png"
      alt="Spa Renaissance"
      style="max-width:120px;height:auto;"
    />
  </div>

  <!-- Nom du spa -->
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
  <div style="
    font-size:15px;
    white-space:pre-line;
  ">
    ${message}
  </div>

  <!-- CTA -->
  <div style="text-align:center;margin:22px 0;">
    <a
      href="https://sparenaissance.ca"
      style="
        display:inline-block;
        padding:12px 26px;
        background-color:#2c5f2d;
        color:#ffffff;
        text-decoration:none;
        border-radius:6px;
        font-weight:600;
        font-size:14px;
      "
    >
      Réserver maintenant
    </a>
  </div>

  <!-- Séparateur -->
  <div style="height:1px;background:#eaeaea;margin:20px 0;"></div>

  <!-- Footer -->
  <div style="
    text-align:center;
    font-size:12px;
    color:#666;
    line-height:1.5;
  ">
    <div style="font-weight:600;color:#2c5f2d;">Spa Renaissance</div>
    <div>info@sparenaissance.ca • 418-968-0606</div>
    <div style="margin-top:6px;color:#999;font-size:11px;">
      © ${new Date().getFullYear()} Spa Renaissance
    </div>
  </div>

</div>

</body>
</html>
`,
};


  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email marketing envoyé à ${email}`);
  } catch (error) {
    console.error(`❌ Erreur envoi email marketing à ${email}:`, error);
    throw error; // Pour les campagnes, on veut tracker les erreurs
  }
}

/**
 * Email de confirmation de réservation
 */
export async function sendBookingConfirmation(booking: {
  bookingNumber: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  professionalName: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  total: number;
  address?: string;
}) {
  const formattedDate = new Date(booking.bookingDate).toLocaleDateString('fr-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mailOptions = {
    from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
    to: booking.clientEmail,
    subject: `✅ Réservation confirmée - ${booking.bookingNumber}`,
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
            ✨ Réservation Confirmée
          </div>

          <p>Bonjour ${booking.clientName},</p>

          <p>Nous avons le plaisir de confirmer votre réservation au Spa Renaissance.</p>

          <!-- Détails de réservation -->
          <div style="
            background:#f9f9f9;
            padding:18px;
            border-left:4px solid #2c5f2d;
            margin:20px 0;
            border-radius:4px;
          ">
            <div style="font-weight:600;color:#2c5f2d;margin-bottom:12px;font-size:16px;">
              Détails de votre réservation
            </div>

            <div style="margin:8px 0;">
              <span style="font-weight:600;color:#666;">Numéro de réservation:</span>
              <span style="color:#1a1a1a;"> ${booking.bookingNumber}</span>
            </div>

            <div style="margin:8px 0;">
              <span style="font-weight:600;color:#666;">Service:</span>
              <span style="color:#1a1a1a;"> ${booking.serviceName}</span>
            </div>

            <div style="margin:8px 0;">
              <span style="font-weight:600;color:#666;">Professionnel(le):</span>
              <span style="color:#1a1a1a;"> ${booking.professionalName}</span>
            </div>

            <div style="margin:8px 0;">
              <span style="font-weight:600;color:#666;">Date:</span>
              <span style="color:#1a1a1a;"> ${formattedDate}</span>
            </div>

            <div style="margin:8px 0;">
              <span style="font-weight:600;color:#666;">Heure:</span>
              <span style="color:#1a1a1a;"> ${booking.startTime} - ${booking.endTime}</span>
            </div>

            <div style="height:1px;background:#eaeaea;margin:12px 0;"></div>

            <div style="margin:8px 0;">
              <span style="font-weight:600;color:#666;">Total payé:</span>
              <span style="font-size:18px;color:#2c5f2d;font-weight:600;"> ${booking.total.toFixed(2)}$ CAD</span>
            </div>
          </div>

          ${booking.address ? `
            <div style="background:#fff3cd;padding:15px;border-radius:5px;margin:20px 0;">
              <p style="margin:0;font-weight:600;">📍 Adresse:</p>
              <p style="margin:5px 0 0 0;">${booking.address}</p>
            </div>
          ` : ''}

          <div style="background:#e8f5e9;padding:15px;border-radius:5px;margin:20px 0;">
            <p style="margin:0;font-weight:600;color:#2c5f2d;">💡 Conseils pour votre visite:</p>
            <ul style="margin:10px 0 0 0;padding-left:20px;">
              <li>Arrivez 10 minutes avant votre rendez-vous</li>
              <li>Apportez une serviette si vous le souhaitez</li>
              <li>Informez-nous de toute condition médicale particulière</li>
            </ul>
          </div>

          <p style="text-align:center;margin-top:22px;color:#2c5f2d;font-weight:600;">
            Nous avons hâte de vous accueillir !
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
          <div>info@sparenaissance.ca • 418-968-0606</div>
          <div style="margin-top:6px;color:#999;font-size:11px;">
            © ${new Date().getFullYear()} Spa Renaissance
          </div>
        </div>

      </div>

      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation de réservation envoyée à ${booking.clientEmail}`);
  } catch (error) {
    console.error('❌ Erreur envoi confirmation:', error);
  }
}

/**
 * Email de rappel 24h avant le rendez-vous
 */
export async function sendBookingReminder(booking: {
  bookingNumber: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  professionalName: string;
  bookingDate: Date;
  startTime: string;
  address?: string;
}) {
  const formattedDate = new Date(booking.bookingDate).toLocaleDateString('fr-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mailOptions = {
    from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
    to: booking.clientEmail,
    subject: `⏰ Rappel: Votre rendez-vous demain - ${booking.bookingNumber}`,
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
            ⏰ Rappel de Rendez-vous
          </div>

          <p>Bonjour ${booking.clientName},</p>

          <p>Nous vous rappelons votre rendez-vous au Spa Renaissance <strong>demain</strong>.</p>

          <!-- Détails du rappel -->
          <div style="
            background:#fff3cd;
            padding:20px;
            border-left:4px solid #2c5f2d;
            margin:20px 0;
            text-align:center;
            border-radius:4px;
          ">
            <p style="margin:0;font-size:16px;">📅 ${formattedDate}</p>
            <p style="font-size:24px;color:#2c5f2d;font-weight:600;margin:10px 0;">
              ${booking.startTime}
            </p>
            <p style="margin:10px 0 0 0;"><strong>${booking.serviceName}</strong></p>
            <p style="margin:5px 0 0 0;">avec ${booking.professionalName}</p>
          </div>

          ${booking.address ? `
            <div style="background:#e8f5e9;padding:15px;border-radius:5px;margin:20px 0;">
              <p style="margin:0;font-weight:600;color:#2c5f2d;">📍 Adresse:</p>
              <p style="margin:5px 0 0 0;">${booking.address}</p>
            </div>
          ` : ''}

          <div style="background:#f9f9f9;padding:15px;border-radius:5px;margin:20px 0;">
            <p style="margin:0;font-weight:600;color:#2c5f2d;">💡 N'oubliez pas:</p>
            <ul style="margin:10px 0 0 0;padding-left:20px;">
              <li>Arrivez 10 minutes avant l'heure</li>
              <li>Apportez une serviette si souhaité</li>
              <li>Prévoyez de quoi vous détendre!</li>
            </ul>
          </div>

          <p style="text-align:center;margin-top:22px;">
            <strong>Besoin d'annuler ou de modifier?</strong><br>
            Contactez-nous au 418-968-0606
          </p>

          <p style="text-align:center;color:#2c5f2d;font-weight:600;margin-top:22px;">
            À demain!
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
          <div>Numéro de réservation: ${booking.bookingNumber}</div>
          <div style="margin-top:6px;">info@sparenaissance.ca • 418-968-0606</div>
          <div style="margin-top:6px;color:#999;font-size:11px;">
            © ${new Date().getFullYear()} Spa Renaissance
          </div>
        </div>

      </div>

      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Rappel envoyé à ${booking.clientEmail}`);
  } catch (error) {
    console.error('❌ Erreur envoi rappel:', error);
  }
}

/**
 * Email de carte cadeau
 */
export async function sendGiftCardEmail(giftCard: {
  code: string;
  amount: number;
  recipientName: string;
  recipientEmail: string;
  senderName?: string;
  message?: string;
}) {
  const mailOptions = {
    from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
    to: giftCard.recipientEmail,
    subject: `🎁 Vous avez reçu une carte cadeau Spa Renaissance!`,
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
            🎁 Carte Cadeau
          </div>

          <p>Bonjour ${giftCard.recipientName},</p>

          <p>${giftCard.senderName ? `<strong>${giftCard.senderName}</strong> vous a` : 'Vous avez reçu'} une carte cadeau pour le Spa Renaissance!</p>

          ${giftCard.message ? `
            <div style="background:#f9f9f9;padding:18px;border-left:4px solid #2c5f2d;margin:20px 0;font-style:italic;border-radius:4px;">
              <p style="margin:0;font-weight:600;color:#2c5f2d;">Message personnel:</p>
              <p style="margin:10px 0 0 0;">"${giftCard.message}"</p>
            </div>
          ` : ''}

          <!-- Carte cadeau -->
          <div style="
            background:#f5f5f5;
            border:2px dashed #2c5f2d;
            padding:30px;
            text-align:center;
            margin:20px 0;
            border-radius:8px;
          ">
            <p style="margin:0;font-size:16px;color:#666;">Valeur de la carte</p>
            <div style="font-size:48px;color:#2c5f2d;font-weight:600;margin:20px 0;">
              ${giftCard.amount.toFixed(2)}$
            </div>

            <p style="margin:20px 0 10px 0;font-weight:600;">Code de la carte:</p>
            <div style="
              background:#ffffff;
              padding:15px;
              border:2px solid #2c5f2d;
              border-radius:6px;
              font-size:24px;
              font-family:monospace;
              letter-spacing:2px;
              margin:20px 0;
              color:#2c5f2d;
              font-weight:600;
            ">
              ${giftCard.code}
            </div>

            <p style="margin:20px 0 0 0;font-size:12px;color:#666;">
              Présentez ce code lors de votre réservation
            </p>
          </div>

          <div style="background:#e8f5e9;padding:15px;border-radius:5px;margin:20px 0;">
            <p style="margin:0;font-weight:600;color:#2c5f2d;">💡 Comment utiliser votre carte:</p>
            <ol style="margin:10px 0 0 0;padding-left:20px;">
              <li>Choisissez votre service préféré</li>
              <li>Réservez en ligne ou par téléphone</li>
              <li>Utilisez le code lors du paiement</li>
            </ol>
          </div>

          <div style="text-align:center;margin:30px 0;">
            <p style="font-size:16px;margin-bottom:12px;">Prêt(e) à réserver?</p>
            <a href="https://spa-renaissance.com" style="
              display:inline-block;
              background:#2c5f2d;
              color:#ffffff;
              padding:12px 26px;
              text-decoration:none;
              border-radius:6px;
              font-weight:600;
              font-size:14px;
            ">Réserver maintenant</a>
          </div>

          <p style="text-align:center;color:#2c5f2d;font-weight:600;margin-top:22px;">
            Profitez de votre moment de détente!
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
          <div>info@sparenaissance.ca • 418-968-0606</div>
          <div style="margin-top:6px;color:#999;font-size:11px;">
            © ${new Date().getFullYear()} Spa Renaissance
          </div>
        </div>

      </div>

      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Carte cadeau envoyée à ${giftCard.recipientEmail}`);
  } catch (error) {
    console.error('❌ Erreur envoi carte cadeau:', error);
  }
}

/**
 * Email de confirmation d'abonnement gym
 */
export async function sendGymSubscriptionConfirmation(subscription: {
  clientName: string;
  clientEmail: string;
  membershipName: string;
  membershipType: string;
  startDate: Date;
  endDate: Date;
  total: number;
}) {
  const formattedStartDate = new Date(subscription.startDate).toLocaleDateString('fr-CA');
  const formattedEndDate = new Date(subscription.endDate).toLocaleDateString('fr-CA');

  const mailOptions = {
    from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
    to: subscription.clientEmail,
    subject: `🏋️ Abonnement Gym Activé - Bienvenue!`,
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
            🏋️ Abonnement Activé!
          </div>

          <p>Bonjour ${subscription.clientName},</p>

          <p>Votre abonnement au gym a été activé avec succès!</p>

          <!-- Détails de l'abonnement -->
          <div style="
            background:#f9f9f9;
            padding:18px;
            border-left:4px solid #2c5f2d;
            margin:20px 0;
            border-radius:4px;
          ">
            <div style="font-weight:600;color:#2c5f2d;margin-bottom:12px;font-size:16px;">
              Détails de votre abonnement
            </div>

            <div style="margin:8px 0;">
              <span style="font-weight:600;color:#666;">Type:</span>
              <span style="color:#1a1a1a;"> ${subscription.membershipName}</span>
            </div>

            <div style="margin:8px 0;">
              <span style="font-weight:600;color:#666;">Début:</span>
              <span style="color:#1a1a1a;"> ${formattedStartDate}</span>
            </div>

            <div style="margin:8px 0;">
              <span style="font-weight:600;color:#666;">Fin:</span>
              <span style="color:#1a1a1a;"> ${formattedEndDate}</span>
            </div>

            <div style="margin:8px 0;">
              <span style="font-weight:600;color:#666;">Total payé:</span>
              <span style="font-size:18px;color:#2c5f2d;font-weight:600;"> ${subscription.total.toFixed(2)}$ CAD</span>
            </div>
          </div>

          <div style="background:#e8f5e9;padding:15px;border-radius:5px;margin:20px 0;">
            <p style="margin:0;font-weight:600;color:#2c5f2d;">💡 Informations importantes:</p>
            <ul style="margin:10px 0 0 0;padding-left:20px;">
              <li>Apportez une serviette et une bouteille d'eau</li>
              <li>Les casiers sont disponibles gratuitement</li>
              <li>Vestiaires avec douches disponibles</li>
            </ul>
          </div>

          <p style="text-align:center;margin-top:22px;color:#2c5f2d;font-weight:600;">
            Bon entraînement!
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
          <div>info@sparenaissance.ca • 418-968-0606</div>
          <div style="margin-top:6px;color:#999;font-size:11px;">
            © ${new Date().getFullYear()} Spa Renaissance
          </div>
        </div>

      </div>

      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation d'abonnement gym envoyée à ${subscription.clientEmail}`);
  } catch (error) {
    console.error('❌ Erreur envoi confirmation gym:', error);
  }
}

/**
 * Email générique (pour les messages automatisés par IA)
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const mailOptions = {
    from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${options.to}`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email à ${options.to}:`, error);
    throw error;
  }
}

/**
 * Tester la connexion SMTP
 */
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Connexion SMTP établie avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion SMTP:', error);
    return false;
  }
}
