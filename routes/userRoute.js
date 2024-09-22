import express from 'express';

import UserController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.post("/usersIdByPhone", UserController.PostByPhone);
router.post("/signup", upload.single('image'), UserController.signUpUser);
router.post('/login', UserController.login);
router.post("/resetPassword", UserController.resetPassword);
router.get("/users", UserController.getAllUser);
router.get("/users/:id", authMiddleware, UserController.getUserById);
router.put("/users/:id", authMiddleware, upload.single('image'), UserController.updateUserProfile);
router.delete("/users/:id", authMiddleware, UserController.deleteUser);

export default router;