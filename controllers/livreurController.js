import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Fonction utilitaire pour gérer les erreurs serveur
const handleServerError = (res, error) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

export default {
  // Inscription d'un nouveau livreur
  async signUpLivreur(req, res) {
    try {
      const { username, prenom, email, password, telephone, typeVehicule, plaqueVehicule } = req.body;
      
      // Validation des champs requis
      if (!username || !email || !password || !telephone) {
        return res.status(400).json({ 
          message: 'Tous les champs obligatoires doivent être remplis' 
        });
      }

      // Vérification si un livreur existe déjà
      const existingLivreur = await prisma.livreur.findFirst({
        where: {
          OR: [
            { email },
            { telephone }
          ]
        }
      });

      if (existingLivreur) {
        return res.status(409).json({ 
          message: 'Email ou téléphone déjà utilisé' 
        });
      }

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Création du nouveau livreur
      const newLivreur = await prisma.livreur.create({
        data: {
          username,
          prenom,
          email,
          password: hashedPassword,
          telephone,
          image: req.file?.filename || null,
          typeVehicule: typeVehicule || 'MOTO',
          plaqueVehicule: plaqueVehicule || null
        },
        include: {
          livraisons: true,
          NotificationHistory: true,
          HistoriquePosition: true
        }
      });

      // Génération du token JWT pour le nouveau livreur
      const token = jwt.sign(
        { 
          livreurId: newLivreur.id, 
          email: newLivreur.email, 
          telephone: newLivreur.telephone 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Livreur créé avec succès veilleur de vous connecter',
        livreur: {
          id: newLivreur.id,
          username: newLivreur.username,
          prenom: newLivreur.prenom,
          email: newLivreur.email,
          telephone: newLivreur.telephone,
          image: newLivreur.image,
          disponible: newLivreur.disponible,
          note: newLivreur.note,
          totalLivraisons: newLivreur.totalLivraisons,
          typeVehicule: newLivreur.typeVehicule,
          plaqueVehicule: newLivreur.plaqueVehicule
        },
        token
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Connexion d'un livreur
  async loginLivreur(req, res) {
    try {
      const { email, telephone, password, identifier } = req.body;

       let searchEmail = email;
       let searchTelephone = telephone;
    
    if (identifier) {
      const isEmail = identifier.includes('@');
      if (isEmail) {
        searchEmail = identifier;
      } else {
        searchTelephone = identifier;
      }
    }

      // Validation des champs requis
      if (!password || (!searchEmail && !searchTelephone)) {
        return res.status(400).json({ 
          message: 'Email/téléphone et mot de passe requis' 
        });
      }

      // Recherche du livreur par email ou téléphone
     const livreur = await prisma.livreur.findFirst({
      where: {
        OR: [
          searchEmail ? { email: searchEmail } : {},
          searchTelephone ? { telephone: searchTelephone } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      }
    });

    if (!livreur) {
      return res.status(401).json({ 
        message: "Identifiants invalides" 
      });
    }


      // Vérification du mot de passe
      const isPasswordValid = await bcrypt.compare(password, livreur.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: 'Identifiants invalides' 
        });
      }

      // Génération du token JWT
      const token = jwt.sign(
        { 
          livreurId: livreur.id, 
          email: livreur.email, 
          telephone: livreur.telephone 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: 'Authentification réussie',
        livreur: {
          id: livreur.id,
          username: livreur.username,
          prenom: livreur.prenom,
          email: livreur.email,
          telephone: livreur.telephone,
          image: livreur.image,
          disponible: livreur.disponible,
          note: livreur.note,
          totalLivraisons: livreur.totalLivraisons,
          typeVehicule: livreur.typeVehicule,
          plaqueVehicule: livreur.plaqueVehicule
        },
        token
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Récupérer tous les livreurs
  async getAllLivreur(req, res) {
    try {
      const livreurs = await prisma.livreur.findMany({
        select: {
          id: true,
          username: true,
          prenom: true,
          email: true,
          telephone: true,
          image: true,
          disponible: true,
          note: true,
          totalLivraisons: true,
          createdAt: true,
          updatedAt: true,
          typeVehicule: true,
          plaqueVehicule: true,
          positionActuelle: true,
          // Relations
          livraisons: {
            select: {
              id: true,
              createdAt: true,
              // ajoutez d'autres champs de livraison si nécessaire
            }
          }
        }
      });

      res.status(200).json({
        message: 'Livreurs récupérés avec succès',
        livreurs,
        count: livreurs.length
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer un livreur
  async deleteLivreur(req, res) {
    try {
      const { id } = req.params;

      // Vérification si le livreur existe
      const existingLivreur = await prisma.livreur.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingLivreur) {
        return res.status(404).json({ 
          message: 'Livreur non trouvé' 
        });
      }

      // Suppression du livreur
      await prisma.livreur.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({
        message: 'Livreur supprimé avec succès'
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour un livreur
  async updateLivreur(req, res) {
    try {
      const { id } = req.params;
      const { 
        username, 
        prenom, 
        email, 
        telephone, 
        password, 
        disponible, 
        typeVehicule, 
        plaqueVehicule,
        pushToken,
        deviceId,
        positionActuelle
      } = req.body;

      // Vérification si le livreur existe
      const existingLivreur = await prisma.livreur.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingLivreur) {
        return res.status(404).json({ 
          message: 'Livreur non trouvé' 
        });
      }

      // Vérification des doublons email/téléphone (sauf pour le livreur actuel)
      if (email || telephone) {
        const duplicate = await prisma.livreur.findFirst({
          where: {
            AND: [
              { id: { not: parseInt(id) } },
              {
                OR: [
                  email ? { email } : {},
                  telephone ? { telephone } : {}
                ].filter(condition => Object.keys(condition).length > 0)
              }
            ]
          }
        });

        if (duplicate) {
          return res.status(409).json({ 
            message: 'Email ou téléphone déjà utilisé par un autre livreur' 
          });
        }
      }

      // Préparation des données à mettre à jour
      const updateData = {};
      if (username) updateData.username = username;
      if (prenom) updateData.prenom = prenom;
      if (email) updateData.email = email;
      if (telephone) updateData.telephone = telephone;
      if (req.file?.filename) updateData.image = req.file.filename;
      if (typeof disponible === 'boolean') updateData.disponible = disponible;
      if (typeVehicule) updateData.typeVehicule = typeVehicule;
      if (plaqueVehicule) updateData.plaqueVehicule = plaqueVehicule;
      if (pushToken) updateData.pushToken = pushToken;
      if (deviceId) updateData.deviceId = deviceId;
      if (positionActuelle) updateData.positionActuelle = positionActuelle;
      
      // Hachage du nouveau mot de passe si fourni
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      // Mise à jour du livreur
      const updatedLivreur = await prisma.livreur.update({
        where: { id: parseInt(id) },
        data: updateData,
        select: {
          id: true,
          username: true,
          prenom: true,
          email: true,
          telephone: true,
          image: true,
          disponible: true,
          note: true,
          totalLivraisons: true,
          typeVehicule: true,
          plaqueVehicule: true,
          updatedAt: true
        }
      });

      res.status(200).json({
        message: 'Livreur mis à jour avec succès',
        livreur: updatedLivreur
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour la disponibilité d'un livreur
  async updateDisponibilite(req, res) {
    try {
      const { id } = req.params;
      const { disponible } = req.body;

      if (typeof disponible !== 'boolean') {
        return res.status(400).json({
          message: 'Le champ disponible doit être un booléen'
        });
      }

      const updatedLivreur = await prisma.livreur.update({
        where: { id: parseInt(id) },
        data: { disponible },
        select: {
          id: true,
          username: true,
          disponible: true,
          updatedAt: true
        }
      });

      res.status(200).json({
        message: 'Disponibilité mise à jour avec succès',
        livreur: updatedLivreur
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour la position d'un livreur
  async updatePosition(req, res) {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          message: 'Latitude et longitude requises'
        });
      }

      const positionActuelle = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: new Date().toISOString()
      };

      // Mise à jour de la position actuelle
      const updatedLivreur = await prisma.livreur.update({
        where: { id: parseInt(id) },
        data: { positionActuelle },
        select: {
          id: true,
          username: true,
          positionActuelle: true,
          updatedAt: true
        }
      });

      // Ajout dans l'historique des positions
      await prisma.historiquePosition.create({
        data: {
          livreurId: parseInt(id),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      });

      res.status(200).json({
        message: 'Position mise à jour avec succès',
        livreur: updatedLivreur
      });
    } catch (error) {
      handleServerError(res, error);
    }
  }
};