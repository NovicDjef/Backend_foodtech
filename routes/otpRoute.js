import otpController from '../controllers/otpController.js';
import express from 'express'

const router = express.Router();

router.get("/otp", otpController.getAllOtp);
router.get("/otp/:id", otpController.getByIdOtp);
router.post("/phone-otp", otpController.addPhoneUserOTP)
router.post('/verify-otp', otpController.verifyOTP)
router.patch('/update-user/:id', otpController.updateUser)


export default router


