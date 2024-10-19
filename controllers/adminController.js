import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default {
  // Fonction d'inscription d'un admin avec génération de token JWT
  async signUpAdmin(req, res) {
    try {
      const { username, email, password, phone } = req.body;

      // Vérifier si un admin avec cet email ou téléphone existe déjà
      const existingAdmin = await prisma.admin.findFirst({
        where: {
          OR: [
            { email },
            { phone }
          ]
        }
      });

      if (existingAdmin) {
        return res.status(409).json({ message: 'Email ou téléphone déjà utilisé' });
      }

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Création du nouvel admin
      const newAdmin = await prisma.admin.create({
        data: {
          username,
          email,
          password: hashedPassword,
          phone,
          image: req.file?.filename
        },
        include: {
          userRoles: true,
          restaurants: true,
          geolocalisation: true
        }
      });

      // Génération du token JWT pour le nouvel admin
      const token = jwt.sign(
        { adminId: newAdmin.id, email: newAdmin.email, phone: newAdmin.phone },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(201).json({
        message: 'Admin créé avec succès',
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email,
          phone: newAdmin.phone
        },
        token
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Fonction pour authentifier l'admin (connexion)
  async login(req, res) {
    try {
      const { email, phone, password } = req.body;

      // Recherche de l'admin par email ou téléphone
      const admin = await prisma.admin.findFirst({
        where: {
          OR: [
            { email },
            { phone }
          ]
        }
      });

      if (!admin) {
        return res.status(401).json({ message: "Admin non trouvé" });
      }

      // Vérification du mot de passe
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Identifiants invalides' });
      }

      // Génération du token JWT
      const token = jwt.sign(
        { adminId: admin.id, email: admin.email, phone: admin.phone },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }  // Expiration de 1 heure
      );

      res.status(200).json({
        message: 'Authentification réussie',
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          phone: admin.phone
        },
        token
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Autres fonctions d'administration (getAllAdmins, getAdminById, etc.)

  async getAllAdmins(req, res) {
    try {
      const admins = await prisma.admin.findMany({
        include: {
          userRoles: true,
          restaurants: true,
          geolocalisation: true
        }
      });

      res.status(200).json(admins);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async getAdminById(req, res) {
    try {
      const { id } = req.params;
      const admin = await prisma.admin.findUnique({
        where: { id: parseInt(id) },
        include: {
          userRoles: true,
          restaurants: true,
          geolocalisation: true
        }
      });

      if (!admin) {
        return res.status(404).json({ message: 'Admin non trouvé' });
      }

      res.status(200).json(admin);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async updateAdmin(req, res) {
    try {
      const { id } = req.params;
      const { username, email, phone } = req.body;

      const updatedAdmin = await prisma.admin.update({
        where: { id: parseInt(id) },
        data: {
          username,
          email,
          phone,
          image: req.file?.filename
        }
      });

      res.status(200).json({
        message: 'Admin mis à jour avec succès',
        admin: updatedAdmin
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async deleteAdmin(req, res) {
    try {
      const { id } = req.params;

      await prisma.admin.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: 'Admin supprimé avec succès' });
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

// Fonction pour gérer les erreurs serveur
function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}
