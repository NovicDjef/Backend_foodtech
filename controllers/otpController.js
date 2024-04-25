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
        try {
            const userData = req.body.userData
            const user = await User.create({ data: userData });
            
            // Génération de l'OTP
        const otpCode = generateOTP();
              
        // Création de l'OTP avec une référence à l'utilisateur créé
        const result = await prisma.OTP.create({ 
            data: { 
                phone: userData.phone,
                code: parseInt(otpCode),
                user: { connect: { id: user.id } } 
            } 
        });
        console.log("resultat  :", result);
        res.status(200).json({
            message: 'user & OTP and phone create success',
            user,
            result,
        });
          } catch (error) {
            console.log("erreirhnnndnd : ", error)
            return handleServerError(res, error);
          }
    },

    async verifyOTP(req, res) {
        const { phone, otpCode } = req.body;
     
        try {
            const userOTP = await prisma.OTP.findFirst({
                where: {
                    phone: phone,
                    code: parseInt(otpCode),
                    expiredAt: { gte: new Date() } // Vérifiez si l'OTP n'est pas expiré
                }
            });
            const codeSend = req.body.otpCode 
            console.debug( "sendCode: ", codeSend,)
            if (!userOTP) {
                return res.status(400).json({ message: 'Invalid or expired OTP code' });
            }
            // Vérifiez si l'OTP entré par l'utilisateur correspond à celui stocké dans la base de données
            if (userOTP.code !== codeSend) {
                return res.status(400).json({ message: 'Incorrect OTP code' });
            } else {
                return res.status(200).json({ message: 'OTP code verified successfully' });
            }
    
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Something went wrong', error: error.message });
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
