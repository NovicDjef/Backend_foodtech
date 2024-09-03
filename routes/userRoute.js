import express from 'express';
import upload from '../middlewares/multer.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import UserController from '../controllers/userController.js';

const router = express.Router();

router.post("/signup", upload.single('image'), UserController.signUpUser);
router.post('/login', UserController.login);
router.get("/users", authMiddleware, UserController.getAllUser);
router.get("/users/:id", authMiddleware, UserController.getUserById);
router.put("/users/:id", authMiddleware, upload.single('image'), UserController.updateUserProfile);
router.delete("/users/:id", authMiddleware, UserController.deleteUser);

export default router;