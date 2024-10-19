import express from 'express';

import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.post("/usersIdByPhone", userController.PostByPhone);
router.post("/signup", upload.single('image'), userController.signUpUser);
router.post('/login', userController.login);
router.post("/resetPassword", userController.resetPassword);
router.get("/users", userController.getAllUser);
router.get("/users/:id", authMiddleware('ADMIN'), userController.getUserById);
router.put("/users/:id", authMiddleware('ADMIN'), upload.single('image'), userController.updateUserProfile);
router.delete("/users/:id", authMiddleware('ADMIN'), userController.deleteUser);

export default router;