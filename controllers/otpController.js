import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//const { otp: OTP } = prisma;
const { user: User } = prisma;
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

    async addPhoneUserOTP(req, res){
        const {username, phone} = req.body;
        try { 
            const existingUser = await User.findUnique({
                where: {
                    phone,
                },
            });

            if (existingUser) {
                return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé. Veuillez en choisir un autre." });
            }

            const newUser = await User.create({ 
                data:{
                    username, 
                    phone
                }});
            
            const otpCode = generateOTP();
        
            // Enregistre le code OTP dans la base de données
            const otpEntry = await prisma.OTP.create({
              data: { 
                phone, 
                code: parseInt(otpCode), 
                user: { connect: { id: newUser.id } } 
            }
            });
        
            // Envoie le code OTP à l'utilisateur (par SMS, par exemple)
                console.log("code Otp Generé :", otpCode)
            res.status(201).json({
              message: "User created successfully",
              user: newUser,
              otpEntry
            });
          } catch (error) {
            console.log("erreur : ", error)
            return handleServerError(res, error);
          }    
    },

    async verifyOTP(req, res) {
      try {
          const { phone, code } = req.body;
         
          if (!code) {
            return res.status(400).json({ message: "Les informations nécessaires sont manquantes." });
          }
                const otpEntry = await prisma.OTP.findFirst({
              where: { 
                  phone, 
                  code: parseInt(code)
              }
          });
          console.debug("dddddd :", code )
        if (!otpEntry || (otpEntry.code !== parseInt(code))) {
           
             const message = "Le code que vous avez entré est incorrect renseigner le code qui vous a été envoyé pas SMS" 
             return res.status(400).json({ message: message})
           
        }
     
          // Supprime l'entrée OTP après la vérification réussie
          await prisma.OTP.delete({ where: { id: otpEntry.id } });
      
          res.status(200).json({ message: "Feleciation!! vous avez terminer votre incription profité des merveilles de TchopTchup" });
      } catch (error) {
          return handleServerError(res, error);
      }
  }
  
    };

    function handleServerError(res, error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error: error });
    }

    function generateOTP() {
    const otpLength = 5; // Longueur du code OTP
    const digits = '0123456789'; // Caractères autorisés pour le code OTP
    let code = '';
    for (let i = 0; i < otpLength; i++) {
        code += digits[Math.floor(Math.random() * 10)]; // Sélection aléatoire d'un chiffre
    }
    return code;
    }
    // function isValidPhoneNumber(phone) {
    //     const phoneRegex = /^[0-9]{9}$/;
    //     return phoneRegex.test(phone);
    // }
