/**
 * Script de test pour vérifier la configuration SendGrid
 * Usage: node test-sendgrid.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSendGrid() {
  console.log('🧪 Test de la configuration SendGrid...\n');

  // Vérifier que les variables d'environnement sont définies
  if (!process.env.SMTP_PASSWORD || process.env.SMTP_PASSWORD === 'VOTRE_CLE_API_SENDGRID_ICI') {
    console.error('❌ Erreur: SMTP_PASSWORD non configuré dans .env');
    console.log('\n📝 Instructions:');
    console.log('1. Allez sur https://app.sendgrid.com/settings/api_keys');
    console.log('2. Créez une clé API avec "Full Access"');
    console.log('3. Copiez la clé (commence par SG.)');
    console.log('4. Remplacez VOTRE_CLE_API_SENDGRID_ICI dans le fichier .env\n');
    process.exit(1);
  }

  console.log('📧 Configuration détectée:');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   From: ${process.env.SMTP_FROM}`);
  console.log(`   Password: ${process.env.SMTP_PASSWORD.substring(0, 10)}...`);
  console.log('');

  // Créer le transporteur
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Test 1: Vérifier la connexion
  console.log('🔌 Test 1: Vérification de la connexion SMTP...');
  try {
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie!\n');
  } catch (error) {
    console.error('❌ Erreur de connexion SMTP:', error.message);
    console.log('\n💡 Vérifiez:');
    console.log('   - Que votre clé API SendGrid est valide');
    console.log('   - Que vous avez vérifié votre email expéditeur sur SendGrid');
    console.log('   - Que SMTP_USER est bien "apikey" (sans guillemets)\n');
    process.exit(1);
  }

  // Test 2: Envoyer un email de test
  console.log('📨 Test 2: Envoi d\'un email de test...');

  const testEmail = process.env.SMTP_FROM; // Envoyer à vous-même pour tester

  console.log(`   Destinataire: ${testEmail}`);

  try {
    const info = await transporter.sendMail({
      from: `"Spa Renaissance" <${process.env.SMTP_FROM}>`,
      to: testEmail,
      subject: '🧪 Test SendGrid - Spa Renaissance',
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
              .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 SendGrid Configuré !</h1>
              </div>
              <div class="content">
                <div class="success">
                  <strong>✅ Succès !</strong><br>
                  Votre configuration SendGrid fonctionne parfaitement.
                </div>

                <p><strong>Configuration testée :</strong></p>
                <ul>
                  <li>SMTP Host: ${process.env.SMTP_HOST}</li>
                  <li>Port: ${process.env.SMTP_PORT}</li>
                  <li>Email expéditeur: ${process.env.SMTP_FROM}</li>
                </ul>

                <p>Vous pouvez maintenant :</p>
                <ul>
                  <li>✅ Envoyer des reçus aux clients</li>
                  <li>✅ Envoyer des emails de bienvenue</li>
                  <li>✅ Envoyer des confirmations de réservation</li>
                  <li>✅ Envoyer des campagnes marketing</li>
                </ul>

                <p style="margin-top: 30px; text-align: center; color: #e24965; font-weight: bold;">
                  Profitez de vos 100 emails gratuits par jour ! 🚀
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Email de test envoyé avec succès!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`\n📬 Vérifiez votre boîte mail: ${testEmail}\n`);

    console.log('╔════════════════════════════════════════╗');
    console.log('║   ✅ SendGrid configuré avec succès!  ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('📊 Limites SendGrid (Plan gratuit):');
    console.log('   - 100 emails par jour');
    console.log('   - Statistiques complètes disponibles');
    console.log('   - Dashboard: https://app.sendgrid.com/statistics\n');

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error.message);

    if (error.message.includes('550')) {
      console.log('\n💡 L\'email expéditeur doit être vérifié sur SendGrid');
      console.log('   Allez sur: https://app.sendgrid.com/settings/sender_auth');
    }

    process.exit(1);
  }
}

// Exécuter le test
testSendGrid().catch(console.error);
