// otpUtils.js

// Fonction pour générer un code OTP aléatoire à 5 chiffres
export function generateOTP() {
  const otp = Math.floor(10000 + Math.random() * 90000); // Génération d'un code aléatoire
  return otp.toString(); // Conversion en chaîne de caractères
}

// Fonction pour stocker le code OTP dans la base de données
export async function storeOTPInDatabase(phone, otp) {
  try {
    // Ici, vous implémenterez la logique pour stocker le code OTP associé au numéro de téléphone dans la base de données
    // Par exemple, avec Prisma :
    // await prisma.otp.create({ data: { phone, otp } });
    console.log(`OTP ${otp} enregistré pour ${phone}`);
  } catch (error) {
    console.error("Erreur lors du stockage du code OTP :", error);
    throw new Error("Erreur lors du stockage du code OTP");
  }
}

// Fonction pour envoyer le code OTP à l'utilisateur (peut varier selon le mode d'envoi)
export async function sendOTPToUser(phone, otp) {
  try {
    // Ici, vous implémenterez la logique pour envoyer le code OTP à l'utilisateur
    // Par exemple, avec un service d'envoi SMS :
    // await smsService.sendSMS(phone, `Votre code OTP est : ${otp}`);
    console.log(`Code OTP ${otp} envoyé à ${phone}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi du code OTP :", error);
    throw new Error("Erreur lors de l'envoi du code OTP");
  }
}
