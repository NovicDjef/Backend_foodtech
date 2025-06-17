// config/firebase-config.js
import admin from 'firebase-admin';
import fs from 'fs';

// Lire et parser le fichier JSON manuellement
const serviceAccount = JSON.parse(fs.readFileSync('./config/serviceAccountKey.json', 'utf8'));

const initializeFirebase = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    // console.log('✅ Firebase initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error);
  }
};

export default initializeFirebase;
