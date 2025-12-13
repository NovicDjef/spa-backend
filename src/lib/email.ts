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
    serviceType === 'MASSOTHERAPIE' ? 'massothérapie' : 'soins esthétiques';

  const mailOptions = {
    from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Bienvenue au Spa Renaissance - Dossier créé avec succès',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #e24965 0%, #8e67d0 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Spa Renaissance</h1>
              <p>Bienvenue dans notre communauté bien-être</p>
            </div>
            <div class="content">
              <h2>Bonjour ${prenom},</h2>

              <p>Merci d'avoir créé votre dossier client pour nos services de ${serviceLabel}.</p>

              <p><strong>Votre dossier a été créé avec succès !</strong></p>

              <p>Notre équipe a bien reçu vos informations et les consultera avant votre rendez-vous. Un professionnel sera assigné à votre dossier selon votre type de service.</p>

              <h3>Que se passe-t-il maintenant ?</h3>
              <ul>
                <li>✅ Votre dossier est enregistré et sécurisé</li>
                <li>✅ Un professionnel sera assigné à votre suivi</li>
                <li>✅ Vos informations restent strictement confidentielles</li>
              </ul>

              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>

              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #e24965; font-weight: bold; font-size: 16px;">
                  Nous avons hâte de prendre soin de vous !
                </p>
              </div>
            </div>
            <div class="footer">
              <p><strong>Spa Renaissance</strong> - Massothérapie & Soins Esthétiques</p>
              <p>📧 contact@sparenaissance.com | 📞 (514) 123-4567</p>
              <p style="margin-top: 20px; font-size: 11px;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
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
