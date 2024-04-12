import userController from "../controllers/userController.js";
import express from 'express'
import upload from '../middlewares/multer.js'

const router = express.Router();

router.get("/users", userController.getAllUser);
router.get("/users/:id", userController.getUserById);
router.post("/user/signIn", upload.single('image'), userController.signUpUser);
router.post("/signInOtp", upload.single('image'), userController.signUpUserOtp);
router.post("/verify-otp", userController.addPhonVerifyOTP)
router.post('/user/login', userController.login)


export default router


