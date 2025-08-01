import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_SENDER = process.env.EMAIL_SENDER;

if (!SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY est requis dans les variables d\'environnement');
}

if (!EMAIL_SENDER) {
  throw new Error('EMAIL_SENDER est requis dans les variables d\'environnement');
}

// Configuration SendGrid
sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Envoie un email avec un code OTP
 * @param {string} email - Adresse email du destinataire
 * @param {string} otp - Code OTP à 6 chiffres
 * @returns {Promise<{success: boolean, message: string, messageId?: string}>}
 */
const sendEmailWithOtp = async (email, otp) => {
  try {
    // Validation des paramètres
    if (!email || typeof email !== 'string') {
      throw new Error('Adresse email invalide');
    }

    if (!otp || typeof otp !== 'string') {
      throw new Error('Code OTP invalide');
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format d\'email invalide');
    }

    console.log(`📧 Envoi OTP vers ${email}...`);

    // Configuration du message
    const msg = {
      to: email.trim().toLowerCase(),
      from: {
        email: EMAIL_SENDER,
        name: 'Équipe Livraison' // Nom d'affichage
      },
      subject: '🔐 Votre code de vérification - Réinitialisation du mot de passe',
      text: `
Bonjour,

Votre code de vérification est : ${otp}

Ce code expire dans 15 minutes pour des raisons de sécurité.

Si vous n'avez pas demandé cette réinitialisation, ignorez ce message.

Équipe Livraison
      `.trim(),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code de vérification</title>
          <style>
            .container {
              max-width: 600px;
              margin: 0 auto;
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .otp-code {
              background: #fff;
              border: 2px solid #667eea;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
              border-radius: 8px;
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6c757d;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Code de Vérification</h1>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              
              <p>Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de vérification :</p>
              
              <div class="otp-code">${otp}</div>
              
              <p>Saisissez ce code dans l'application pour continuer la réinitialisation de votre mot de passe.</p>
              
              <div class="warning">
                <strong>⚠️ Important :</strong>
                <ul>
                  <li>Ce code expire dans <strong>15 minutes</strong></li>
                  <li>Ne partagez jamais ce code avec personne</li>
                  <li>Si vous n'avez pas demandé cette réinitialisation, ignorez ce message</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>Équipe Livraison<br>
              Service de support technique</p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Catégories pour les statistiques SendGrid
      categories: ['password-reset', 'otp-verification'],
      // Tracking
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: true }
      }
    };

    // Envoi de l'email
    const [response] = await sgMail.send(msg);
    
    console.log('✅ Email OTP envoyé avec succès');
    console.log(`📊 Message ID: ${response.headers['x-message-id']}`);
    
    return {
      success: true,
      message: 'Email envoyé avec succès',
      messageId: response.headers['x-message-id']
    };

  } catch (error) {
    console.error('❌ Erreur envoi email OTP:', error);
    
    // Gestion des erreurs spécifiques SendGrid
    if (error.response) {
      const { status, body } = error.response;
      
      switch (status) {
        case 400:
          console.error('❌ Erreur 400 - Données invalides:', body);
          return {
            success: false,
            message: 'Données d\'email invalides'
          };
          
        case 401:
          console.error('❌ Erreur 401 - Clé API invalide');
          return {
            success: false,
            message: 'Configuration SendGrid invalide'
          };
          
        case 403:
          console.error('❌ Erreur 403 - Permissions insuffisantes');
          return {
            success: false,
            message: 'Permissions SendGrid insuffisantes'
          };
          
        case 413:
          console.error('❌ Erreur 413 - Email trop volumineux');
          return {
            success: false,
            message: 'Email trop volumineux'
          };
          
        case 429:
          console.error('❌ Erreur 429 - Limite de taux atteinte');
          return {
            success: false,
            message: 'Trop d\'emails envoyés. Réessayez plus tard'
          };
          
        default:
          console.error(`❌ Erreur SendGrid ${status}:`, body);
          return {
            success: false,
            message: `Erreur SendGrid: ${status}`
          };
      }
    }
    
    // Erreurs de validation ou réseau
    return {
      success: false,
      message: error.message || 'Erreur lors de l\'envoi de l\'email'
    };
  }
};

/**
 * Envoie un email de confirmation de changement de mot de passe
 * @param {string} email - Adresse email du destinataire
 * @param {string} userName - Nom de l'utilisateur
 * @returns {Promise<{success: boolean, message: string}>}
 */
const sendPasswordChangeConfirmation = async (email, userName = 'Utilisateur') => {
  try {
    console.log(`📧 Envoi confirmation changement mot de passe vers ${email}...`);

    const msg = {
      to: email.trim().toLowerCase(),
      from: {
        email: EMAIL_SENDER,
        name: 'Équipe Livraison'
      },
      subject: '✅ Mot de passe modifié avec succès',
      text: `
Bonjour ${userName},

Votre mot de passe a été modifié avec succès.

Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement notre support.

Équipe Livraison
      `.trim(),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Mot de passe modifié</h1>
            </div>
            <div class="content">
              <p>Bonjour ${userName},</p>
              <div class="success">
                <p><strong>Votre mot de passe a été modifié avec succès !</strong></p>
                <p>Date : ${new Date().toLocaleString('fr-FR')}</p>
              </div>
              <p>Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement notre support.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      categories: ['password-change-confirmation'],
    };

    await sgMail.send(msg);
    
    console.log('✅ Email confirmation envoyé avec succès');
    return {
      success: true,
      message: 'Email de confirmation envoyé'
    };

  } catch (error) {
    console.error('❌ Erreur envoi confirmation:', error);
    return {
      success: false,
      message: 'Erreur lors de l\'envoi de la confirmation'
    };
  }
};

// Test de la configuration (optionnel)
const testSendGridConfig = async () => {
  try {
    console.log('🧪 Test de la configuration SendGrid...');
    
    // Test avec un email factice (ne sera pas envoyé)
    const testResult = await sgMail.send({
      to: 'test@example.com',
      from: EMAIL_SENDER,
      subject: 'Test',
      text: 'Test',
    }, false); // false = ne pas envoyer réellement
    
    console.log('✅ Configuration SendGrid OK');
    return true;
  } catch (error) {
    console.error('❌ Configuration SendGrid invalide:', error.message);
    return false;
  }
};

export { sendEmailWithOtp, sendPasswordChangeConfirmation, testSendGridConfig };
export default sendEmailWithOtp;