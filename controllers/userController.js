import { PrismaClient } from '@prisma/client';

import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default  {
  async signUpUser(req, res) {
    try {
      const { username, phone } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { phone } });
      if (existingUser) {
        return res.status(409).json({ message: "Un utilisateur avec ce numéro de téléphone existe déjà" });
      }

      const newUser = await prisma.user.create({
        data: {
          username,
          phone,
          image: req.file?.filename
        }
      });

      // const token = jwt.sign(
      //   { userId: newUser.id, phone: newUser.phone },
      //   process.env.JWT_SECRET,
      //   { expiresIn: '24h' }
      // );

      res.status(201).json({
        success: true,
        message: "Utilisateur créé avec succès",
        userMessage: "Votre compte a été créé avec succès. Bienvenue !",
        user: {
          id: newUser.id,
          username: newUser.username,
          phone: newUser.phone
        },
        //token
      });
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
        res.status(500).json({
          success: false,
          message: "Erreur lors de la création de l'utilisateur",
          userMessage: "Désolé, une erreur est survenue lors de la création de votre compte. Veuillez réessayer plus tard.",
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  },

  async login(req, res) {
    try {
      const { phone } = req.body;

      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      const token = jwt.sign(
        { userId: user.id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: "Connexion réussie",
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone
        },
        token
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async getAllUser(req, res) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          phone: true,
          image: true,
          createdAt: true
        }
      });

      res.status(200).json(users);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
          commandes: true,
          reservations: true,
          favoritePlats: true
        }
      });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      res.status(200).json(user);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async updateUserProfile(req, res) {
    try {
      const { id } = req.params;
      const { username, phone } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          username,
          phone,
          image: req.file?.filename
        }
      });

      res.status(200).json({
        message: "Profil mis à jour avec succès",
        user: updatedUser
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Compte utilisateur supprimé avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  }
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}
