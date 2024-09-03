import express from 'express';
import OTPController from '../controllers/otpController.js';

const router = express.Router();

// Route pour obtenir tous les OTPs
router.get("/otp", OTPController.getAllOtp);

// Route pour obtenir un OTP spécifique par ID
router.get("/otp/:id", OTPController.getByIdOtp);

// Route pour ajouter un nouvel utilisateur et envoyer un OTP
router.post("/phone-otp", OTPController.addPhoneUserOTP);

// Route pour vérifier un OTP
router.post('/verify-otp', OTPController.verifyOTP);

// Route pour mettre à jour les informations d'un utilisateur
router.patch('/update-user/:id', OTPController.updateUser);

export default router;