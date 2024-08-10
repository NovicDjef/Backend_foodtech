import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import twilio from 'twilio';
import dotenv from 'dotenv';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

dotenv.config();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, {
  timeout: 120000 // 60 x 2 seconds timeout
});
//const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);



const { User, OTP } = prisma;
export default {

    async getAllOtp(req, res) {
        try{
            const data = await prisma.OTP.findMany()

            if (data.length > 0) {
                res.status(200).json(data);
              } else {
                res.status(404).json({ message: 'not found data' });
              }
        } catch (error) {
            return handleServerError(res, error);
        }
    },
    
    async getByIdOtp(req, res) {
        const id = parseInt(req.params.id)
        try{
            const data = await prisma.OTP.findUnique({ where: {id} })

            if(data){
                return res.status(200).json(data)
            } else {
                return res.status(404).json({message : "No data Found" })
            }
        } catch (error) {
            return handleServerError(req, error)
        }
    },

    async addPhoneUserOTP(req, res) {
      const { username, phone } = req.body;
      if (!phone) {
        return res.status(400).json({ message: "Le numéro de téléphone est requis." });
      }
      const formattedPhone = phone.startsWith('+') ? phone : `+237${phone}`;
      try {
        const existingUser = await User.findUnique({
          where: {
            phone: formattedPhone,
          },
        });
  
        if (existingUser) {
          return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé. Veuillez en choisir un autre." });
        }
  
        const newUser = await User.create({ 
          data: {
            username, 
            phone: formattedPhone,
          },
        });
  
        const verification = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
          .verifications
          .create({ to: formattedPhone, channel: 'sms' });
  
        const otpEntry = await OTP.create({
          data: {
            phone: formattedPhone,
            verificationSid: verification.sid,
            status: verification.status,
            user: { connect: { id: newUser.id } },
            createdAt: new Date(),
            expiredAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });
  
        res.status(201).json({
          message: "User created successfully",
          user: newUser,
          otpEntry,
          verificationDetails: verification,
        });
      } catch (error) {
        console.error("erreur : ", error);
        return handleServerError(res, error);
      }    
    },
  
    async verifyOTP(req, res) {
      const { phone, code } = req.body;
    
      if (!phone) {
        return res.status(400).json({ success: false, message: "Le numéro de téléphone est requis." });
      }
      if (!code) {
        return res.status(400).json({ success: false, message: "Le code OTP est requis." });
      }
    
      const formattedPhone = phone.startsWith('+') ? phone : `+237${phone}`;
    
      try {
        const verificationCheck = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
          .verificationChecks
          .create({ to: formattedPhone, code });
    
        if (verificationCheck.status === 'approved') {
          const otpEntry = await OTP.findUnique({
            where: { phone: formattedPhone },
          });
    
          if (!otpEntry) {
            return res.status(400).json({ success: false, message: "OTP non trouvé pour ce numéro de téléphone." });
          }
    
          await OTP.update({
            where: { phone: formattedPhone },
            data: { status: 'approved' },
          });
    
          return res.status(200).json({ success: true, message: "Code OTP vérifié avec succès." });
        } else {
          return res.status(400).json({ success: false, message: "Le code OTP est incorrect." });
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du code OTP :", error);
        return res.status(500).json({ success: false, message: "Une erreur s'est produite lors de la vérification du code OTP." });
      }
    },
  
  // async verifyOTP(req, res) {
  //   try {
  //     const { phone, code } = req.body;
  
  //     if (!phone || !code) {
  //       return res.status(400).json({ message: "Les informations nécessaires sont manquantes." });
  //     }
  
  //     const formattedPhone = phone.startsWith('+') ? phone : `+237${phone}`;
  
  //     const otpEntry = await prisma.oTP.findFirst({
  //       where: {
  //         phone: formattedPhone,
  //       },
  //     });
  
  //     if (!otpEntry) {
  //       return res.status(400).json({ message: "Le code que vous avez entré est incorrect. Veuillez renseigner le code qui vous a été envoyé par SMS." });
  //     }
  
  //     const verificationCheck = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
  //       .verificationChecks
  //       .create({ to: formattedPhone, code });
  
  //     if (verificationCheck.status !== 'approved') {
  //       return res.status(400).json({ message: "Le code que vous avez entré est incorrect. Veuillez renseigner le code qui vous a été envoyé par SMS." });
  //     }
  
  //     await prisma.oTP.delete({ where: { id: otpEntry.id } });
  
  //     res.status(200).json({ message: "Félicitations ! Vous avez terminé votre inscription, profitez des merveilles de TchopTchup." });
  //   } catch (error) {
  //     console.error("Erreur :", error);
  //     res.status(500).json({ message: "Erreur du serveur", error: error.message });
  //   }
  // },
  
  async updateUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      const user = {
        username: req.body.username,
        phone: req.body.phone,
      };
      console.log("user :", user)
      const result = await User.update({ data: user, where: { id } });
      res.status(201).json({
        message: 'user update success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },
  
    };

    function handleServerError(res, error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error: error });
    }

    // function generateOTP() {
    // const otpLength = 5; // Longueur du code OTP
    // const digits = '0123456789'; // Caractères autorisés pour le code OTP
    // let code = '';
    // for (let i = 0; i < otpLength; i++) {
    //     code += digits[Math.floor(Math.random() * 10)]; // Sélection aléatoire d'un chiffre
    // }
    // return code;
    // }
    // function isValidPhoneNumber(phone) {
    //     const phoneRegex = /^[0-9]{9}$/;
    //     return phoneRegex.test(phone);
    // }
