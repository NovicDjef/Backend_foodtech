import express from 'express';

import userController from '../controllers/userController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.post("/usersIdByPhone", userController.PostByPhone);
router.post("/signup", upload.single('image'), userController.signUpUser);
router.post('/login', userController.login);
router.post("/resetPassword", userController.resetPassword);
router.get("/users", userController.getAllUser);
router.get("/users/:id", adminAuthMiddleware, userController.getUserById);
router.put("/users/:id", adminAuthMiddleware, upload.single('image'), userController.updateUserProfile);
router.delete("/users/:id", adminAuthMiddleware, userController.deleteUser);

export default router;