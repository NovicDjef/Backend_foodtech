import { PrismaClient } from '@prisma/client';

import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';

import twilio from 'twilio';

const prisma = new PrismaClient();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


export default  {
async signUpUser(req, res) {
  try {
    const { username, phone, password, avatar } = req.body;

    // Validation des entrées
    if (!username || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs requis doivent être remplis",
        userMessage: "Veuillez remplir tous les champs obligatoires."
      });
    }

    // Vérification de l'existence de l'utilisateur
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Un utilisateur avec ce numéro de téléphone existe déjà",
        userMessage: "Ce numéro de téléphone est déjà associé à un compte."
      });
    }

    // Hachage du mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Création de l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        username,
        phone,
        password: hashedPassword,
        avatar: req.file?.filename
      }
    });

    // Génération du token JWT
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, phone: newUser.phone, avatar: newUser.avatar },
      process.env.JWT_SECRET,
      { expiresIn: '4383h' }
    );

    // Réponse au client
    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      userMessage: "Votre compte a été créé avec succès. Bienvenue !",
      user: {
        id: newUser.id,
        username: newUser.username,
        phone: newUser.phone,
        avatar: newUser.avatar
      },
      token
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
    const { phone, password } = req.body;

    // Validation des entrées
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Le numéro de téléphone et le mot de passe sont requis",
        userMessage: "Veuillez entrer votre numéro de téléphone et votre mot de passe."
      });
    }

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
        userMessage: "Aucun compte n'est associé à ce numéro de téléphone."
      });
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe incorrect",
        userMessage: "Le mot de passe entré est incorrect."
      });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, username: user.username, avatar: user.avatar },
      process.env.JWT_SECRET,
      { expiresIn: '4383h' }
    );

    // Réponse au client
    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      userMessage: "Vous êtes maintenant connecté.",
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        avatar: user.avatar
      },
      token
    });

  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
      userMessage: "Désolé, une erreur est survenue lors de la connexion. Veuillez réessayer plus tard.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},

async PostByPhone(req, res) {
  try {
    const { phone } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json(user);
  } catch (error) {
    handleServerError(res, error);
  }
},

// Étape 2: Vérification de l'OTP et réinitialisation du mot de passe
async resetPassword(req, res) {
  try {
    const { phone, newPassword } = req.body;

    // Validation des entrées
    if (!phone || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Le numéro de téléphone et le nouveau mot de passe sont requis",
        userMessage: "Veuillez fournir votre numéro de téléphone et un nouveau mot de passe."
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
        userMessage: "Aucun compte n'est associé à ce numéro de téléphone."
      });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 10; // Vous pouvez ajuster ce nombre selon vos besoins de sécurité
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id, phone: user.phone, username: user.username,},
      data: { password: hashedPassword }
    });

    // Générer un nouveau token JWT
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '4383h' }
    );

    res.status(200).json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
      userMessage: "Votre mot de passe a été réinitialisé. Vous êtes maintenant connecté.",
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone
      },
      token
    });

  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la réinitialisation du mot de passe",
      userMessage: "Une erreur est survenue. Veuillez réessayer plus tard.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},

// Étape 1: Demande de réinitialisation et envoi d'OTP
async requestPasswordReset(req, res){
  try {
    const { phone } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
        userMessage: "Aucun compte n'est associé à ce numéro de téléphone."
      });
    }

    // Générer et sauvegarder l'OTP
    const otp = generateOTP();
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        resetPasswordOTP: otp,
        resetPasswordOTPExpires: new Date(Date.now() + 10 * 60 * 1000) // OTP valide pendant 10 minutes
      }
    });

    // Envoyer l'OTP via Twilio
    await client.messages.create({
      body: `Votre code de réinitialisation de mot de passe est : ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    res.status(200).json({
      success: true,
      message: "Code OTP envoyé",
      userMessage: "Un code de vérification a été envoyé à votre numéro de téléphone."
    });

  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi du code OTP",
      userMessage: "Une erreur est survenue. Veuillez réessayer plus tard.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
          password: true,
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
          image: req.file?.filename,
          password: true,
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
  },

  // Fonction pour générer un code OTP


};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}