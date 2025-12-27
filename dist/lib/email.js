"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendMarketingEmail = sendMarketingEmail;
exports.sendBookingConfirmation = sendBookingConfirmation;
exports.sendBookingReminder = sendBookingReminder;
exports.sendGiftCardEmail = sendGiftCardEmail;
exports.sendGymSubscriptionConfirmation = sendGymSubscriptionConfirmation;
exports.sendEmail = sendEmail;
exports.testEmailConnection = testEmailConnection;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Créer le transporteur
const transporter = nodemailer_1.default.createTransport({
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
async function sendWelcomeEmail(email, prenom, serviceType) {
    const serviceLabel = serviceType === 'MASSOTHERAPIE' ? 'massothérapie' : 'soins esthétiques';
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
              <img src="https://sparenaissance.ca/assets/logo.png" alt="Spa Renaissance" style="max-width: 200px; margin-bottom: 15px;" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
              <h1 style="display: none;">✨ Spa Renaissance</h1>
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
              <p>📧 info@sparenaissance.ca | 📞 (514) 123-4567</p>
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
    }
    catch (error) {
        console.error('❌ Erreur envoi email:', error);
        // Ne pas throw l'erreur pour ne pas bloquer la création du client
        // L'email est optionnel
    }
}
/**
 * Email marketing pour campagnes ADMIN
 */
async function sendMarketingEmail(email, prenom, subject, message) {
    const mailOptions = {
        from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: subject,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden;">

                  <!-- En-tête avec logo -->
                  <tr>
                    <td align="center" style="background: linear-gradient(135deg, #2c5f2d 0%, #1a3d1f 100%); padding: 40px 20px;">
                      <img src="https://sparenaissance.ca/assets/logo.png" alt="Spa Renaissance" style="max-width: 180px; height: auto; display: block; margin: 0 auto 15px;" />
                      <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: normal;">Spa Renaissance</h1>
                    </td>
                  </tr>

                  <!-- Contenu -->
                  <tr>
                    <td style="padding: 40px 30px; background-color: #ffffff;">
                      <h2 style="color: #2c5f2d; font-size: 20px; margin: 0 0 20px 0;">Bonjour ${prenom},</h2>

                      <div style="background: #f9f9f9; padding: 20px; border-left: 4px solid #2c5f2d; margin: 20px 0; white-space: pre-line; line-height: 1.6;">
                        ${message}
                      </div>

                      <!-- Bouton CTA -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="https://sparenaissance.ca" style="display: inline-block; background-color: #2c5f2d; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                              📅 Réserver maintenant
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="text-align: center; color: #666; margin: 20px 0;">
                        Visitez notre site web pour découvrir tous nos services :<br>
                        <a href="https://sparenaissance.ca" style="color: #2c5f2d; font-weight: bold; text-decoration: none;">www.sparenaissance.ca</a>
                      </p>

                      <p style="color: #333; margin: 30px 0 20px 0;">Nous espérons vous revoir très bientôt au Spa Renaissance.</p>

                      <p style="text-align: center; color: #2c5f2d; font-weight: bold; font-size: 16px; margin: 20px 0;">
                        Prenez soin de vous ! 🌸
                      </p>
                    </td>
                  </tr>

                  <!-- Pied de page -->
                  <tr>
                    <td align="center" style="background-color: #f9f9f9; padding: 30px 20px; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">Spa Renaissance</p>
                      <p style="margin: 5px 0; color: #666; font-size: 14px;">Massothérapie & Soins Esthétiques</p>
                      <p style="margin: 5px 0; color: #666; font-size: 14px;">📧 info@sparenaissance.ca</p>
                      <p style="margin: 5px 0; color: #666; font-size: 14px;">📞 418-968-0606</p>
                      <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">
                        © ${new Date().getFullYear()} Spa Renaissance - Tous droits réservés
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email marketing envoyé à ${email}`);
    }
    catch (error) {
        console.error(`❌ Erreur envoi email marketing à ${email}:`, error);
        throw error; // Pour les campagnes, on veut tracker les erreurs
    }
}
/**
 * Email de confirmation de réservation
 */
async function sendBookingConfirmation(booking) {
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
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header {
              background: linear-gradient(135deg, #e24965 0%, #8e67d0 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details {
              background: white;
              padding: 20px;
              border-left: 4px solid #e24965;
              margin: 20px 0;
            }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .total { font-size: 20px; color: #e24965; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Réservation Confirmée</h1>
              <p>Votre rendez-vous est confirmé!</p>
            </div>
            <div class="content">
              <h2>Bonjour ${booking.clientName},</h2>
              <p>Nous avons le plaisir de confirmer votre réservation au Spa Renaissance.</p>

              <div class="booking-details">
                <h3 style="margin-top: 0; color: #e24965;">Détails de votre réservation</h3>

                <div class="detail-row">
                  <span class="label">Numéro de réservation:</span>
                  <span class="value">${booking.bookingNumber}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Service:</span>
                  <span class="value">${booking.serviceName}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Professionnel(le):</span>
                  <span class="value">${booking.professionalName}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span class="value">${formattedDate}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Heure:</span>
                  <span class="value">${booking.startTime} - ${booking.endTime}</span>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">

                <div class="detail-row">
                  <span class="label">Total payé:</span>
                  <span class="total">${booking.total.toFixed(2)}$ CAD</span>
                </div>
              </div>

              ${booking.address ? `
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>📍 Adresse:</strong></p>
                  <p style="margin: 5px 0 0 0;">${booking.address}</p>
                </div>
              ` : ''}

              <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>💡 Conseils pour votre visite:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Arrivez 10 minutes avant votre rendez-vous</li>
                  <li>Apportez une serviette si vous le souhaitez</li>
                  <li>Informez-nous de toute condition médicale particulière</li>
                </ul>
              </div>

              <p style="text-align: center; margin-top: 30px; color: #e24965; font-weight: bold;">
                Nous avons hâte de vous accueillir !
              </p>
            </div>
            <div class="footer">
              <p><strong>Spa Renaissance</strong> - Massothérapie & Soins Esthétiques</p>
              <p>📧 info@sparenaissance.ca | 📞 (514) 123-4567</p>
            </div>
          </div>
        </body>
      </html>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Confirmation de réservation envoyée à ${booking.clientEmail}`);
    }
    catch (error) {
        console.error('❌ Erreur envoi confirmation:', error);
    }
}
/**
 * Email de rappel 24h avant le rendez-vous
 */
async function sendBookingReminder(booking) {
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
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header {
              background: linear-gradient(135deg, #ffa726 0%, #ff7043 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-box {
              background: #fff3cd;
              padding: 20px;
              border-left: 4px solid #ffa726;
              margin: 20px 0;
              text-align: center;
            }
            .time { font-size: 24px; color: #ff7043; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Rappel de Rendez-vous</h1>
              <p>C'est demain!</p>
            </div>
            <div class="content">
              <h2>Bonjour ${booking.clientName},</h2>

              <p>Nous vous rappelons votre rendez-vous au Spa Renaissance <strong>demain</strong>.</p>

              <div class="reminder-box">
                <p style="margin: 0; font-size: 16px;">📅 ${formattedDate}</p>
                <p class="time">${booking.startTime}</p>
                <p style="margin: 10px 0 0 0;"><strong>${booking.serviceName}</strong></p>
                <p style="margin: 5px 0 0 0;">avec ${booking.professionalName}</p>
              </div>

              ${booking.address ? `
                <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>📍 Adresse:</strong></p>
                  <p style="margin: 5px 0 0 0;">${booking.address}</p>
                </div>
              ` : ''}

              <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>💡 N'oubliez pas:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Arrivez 10 minutes avant l'heure</li>
                  <li>Apportez une serviette si souhaité</li>
                  <li>Prévoyez de quoi vous détendre!</li>
                </ul>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                <strong>Besoin d'annuler ou de modifier?</strong><br>
                Contactez-nous au (514) 123-4567
              </p>

              <p style="text-align: center; color: #ff7043; font-weight: bold; margin-top: 30px;">
                À demain! 🌸
              </p>
            </div>
            <div class="footer">
              <p><strong>Spa Renaissance</strong></p>
              <p>Numéro de réservation: ${booking.bookingNumber}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Rappel envoyé à ${booking.clientEmail}`);
    }
    catch (error) {
        console.error('❌ Erreur envoi rappel:', error);
    }
}
/**
 * Email de carte cadeau
 */
async function sendGiftCardEmail(giftCard) {
    const mailOptions = {
        from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
        to: giftCard.recipientEmail,
        subject: `🎁 Vous avez reçu une carte cadeau Spa Renaissance!`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header {
              background: linear-gradient(135deg, #e24965 0%, #8e67d0 100%);
              color: white;
              padding: 40px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .gift-card {
              background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
              border: 2px dashed #e24965;
              padding: 30px;
              text-align: center;
              margin: 20px 0;
              border-radius: 10px;
            }
            .amount { font-size: 48px; color: #e24965; font-weight: bold; margin: 20px 0; }
            .code {
              background: white;
              padding: 15px;
              border: 2px solid #e24965;
              border-radius: 5px;
              font-size: 24px;
              font-family: monospace;
              letter-spacing: 2px;
              margin: 20px 0;
            }
            .message-box {
              background: white;
              padding: 20px;
              border-left: 4px solid #8e67d0;
              margin: 20px 0;
              font-style: italic;
            }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 Carte Cadeau</h1>
              <p style="font-size: 18px; margin: 0;">Spa Renaissance</p>
            </div>
            <div class="content">
              <h2>Bonjour ${giftCard.recipientName},</h2>

              <p>${giftCard.senderName ? `<strong>${giftCard.senderName}</strong> vous a` : 'Vous avez reçu'} une carte cadeau pour le Spa Renaissance!</p>

              ${giftCard.message ? `
                <div class="message-box">
                  <p style="margin: 0;"><strong>Message personnel:</strong></p>
                  <p style="margin: 10px 0 0 0;">"${giftCard.message}"</p>
                </div>
              ` : ''}

              <div class="gift-card">
                <p style="margin: 0; font-size: 18px;">Valeur de la carte</p>
                <div class="amount">${giftCard.amount.toFixed(2)}$</div>

                <p style="margin: 20px 0 10px 0; font-weight: bold;">Code de la carte:</p>
                <div class="code">${giftCard.code}</div>

                <p style="margin: 20px 0 0 0; font-size: 12px; color: #666;">
                  Présentez ce code lors de votre réservation
                </p>
              </div>

              <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>💡 Comment utiliser votre carte:</strong></p>
                <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Choisissez votre service préféré</li>
                  <li>Réservez en ligne ou par téléphone</li>
                  <li>Utilisez le code lors du paiement</li>
                </ol>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p style="font-size: 16px; margin-bottom: 10px;">Prêt(e) à réserver?</p>
                <a href="https://spa-renaissance.com" style="
                  display: inline-block;
                  background: #e24965;
                  color: white;
                  padding: 15px 30px;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
                ">Réserver maintenant</a>
              </div>

              <p style="text-align: center; color: #e24965; font-weight: bold; margin-top: 30px;">
                Profitez de votre moment de détente! 🌸
              </p>
            </div>
            <div class="footer">
              <p><strong>Spa Renaissance</strong> - Massothérapie & Soins Esthétiques</p>
              <p>📧 info@sparenaissance.ca | 📞 (514) 123-4567</p>
            </div>
          </div>
        </body>
      </html>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Carte cadeau envoyée à ${giftCard.recipientEmail}`);
    }
    catch (error) {
        console.error('❌ Erreur envoi carte cadeau:', error);
    }
}
/**
 * Email de confirmation d'abonnement gym
 */
async function sendGymSubscriptionConfirmation(subscription) {
    const formattedStartDate = new Date(subscription.startDate).toLocaleDateString('fr-CA');
    const formattedEndDate = new Date(subscription.endDate).toLocaleDateString('fr-CA');
    const mailOptions = {
        from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
        to: subscription.clientEmail,
        subject: `🏋️ Abonnement Gym Activé - Bienvenue!`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header {
              background: linear-gradient(135deg, #4caf50 0%, #2196f3 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .sub-details {
              background: white;
              padding: 20px;
              border-left: 4px solid #4caf50;
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏋️ Abonnement Activé!</h1>
              <p>Bienvenue au Gym Spa Renaissance</p>
            </div>
            <div class="content">
              <h2>Bonjour ${subscription.clientName},</h2>

              <p>Votre abonnement au gym a été activé avec succès!</p>

              <div class="sub-details">
                <h3 style="margin-top: 0; color: #4caf50;">Détails de votre abonnement</h3>

                <p><strong>Type:</strong> ${subscription.membershipName}</p>
                <p><strong>Début:</strong> ${formattedStartDate}</p>
                <p><strong>Fin:</strong> ${formattedEndDate}</p>
                <p><strong>Total payé:</strong> ${subscription.total.toFixed(2)}$ CAD</p>
              </div>

              <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>💡 Informations importantes:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Apportez une serviette et une bouteille d'eau</li>
                  <li>Les casiers sont disponibles gratuitement</li>
                  <li>Vestiaires avec douches disponibles</li>
                </ul>
              </div>

              <p style="text-align: center; color: #4caf50; font-weight: bold; margin-top: 30px;">
                Bon entraînement! 💪
              </p>
            </div>
            <div class="footer">
              <p><strong>Spa Renaissance</strong> - Gym & Bien-être</p>
              <p>📧 info@sparenaissance.ca | 📞 (514) 123-4567</p>
            </div>
          </div>
        </body>
      </html>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Confirmation d'abonnement gym envoyée à ${subscription.clientEmail}`);
    }
    catch (error) {
        console.error('❌ Erreur envoi confirmation gym:', error);
    }
}
/**
 * Email générique (pour les messages automatisés par IA)
 */
async function sendEmail(options) {
    const mailOptions = {
        from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email envoyé à ${options.to}`);
    }
    catch (error) {
        console.error(`❌ Erreur lors de l'envoi de l'email à ${options.to}:`, error);
        throw error;
    }
}
/**
 * Tester la connexion SMTP
 */
async function testEmailConnection() {
    try {
        await transporter.verify();
        console.log('✅ Connexion SMTP établie avec succès');
        return true;
    }
    catch (error) {
        console.error('❌ Erreur de connexion SMTP:', error);
        return false;
    }
}
//# sourceMappingURL=email.js.map