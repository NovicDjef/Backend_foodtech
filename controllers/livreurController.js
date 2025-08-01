import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {sendEmailWithOtp} from '../utils/mailer.js';

const prisma = new PrismaClient();

const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6 digits
}
// Fonction utilitaire pour gérer les erreurs serveur
const handleServerError = (res, error) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};
const notifyClient = async (clientPushToken, notification) => {
  try {
    const message = {
      token: clientPushToken,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: {
        type: 'ORDER_UPDATE',
        commandeId: notification.commandeId.toString()
      }
    };

    await admin.messaging().send(message);
    console.log('✅ Client notifié:', notification.title);
    
  } catch (error) {
    console.error('❌ Erreur notification client:', error);
  }
}

export default {

async sendOtp (req,res) {
  const { email } = req.body

  const livreur = await prisma.livreur.findUnique({ where: { email } })
  if (!user) return res.status(404).json({ message: 'User not found' })

  const otpCode = generateOtpCode()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

  await prisma.passwordReset.create({
    data: {
      email,
      otp: otpCode,
      expiresAt
    }
  })

  await sendEmailWithOtp(email, otpCode)

  res.json({ message: 'OTP sent to email' })
},

async verifyOtp (req, res) {
  const { email, otp, newPassword } = req.body

  const record = await prisma.passwordReset.findFirst({
    where: {
      email,
      otp,
      expiresAt: { gt: new Date() }
    }
  })

  if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' })

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.livreur.update({
    where: { email },
    data: { password: hashedPassword }
  })

  await prisma.passwordReset.deleteMany({ where: { email } })

  res.json({ message: 'Password updated successfully' })
},


async sendEmailWithOtp (email, otp) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Votre code OTP pour réinitialiser le mot de passe',
    text: `Votre code OTP est : ${otp}. Il expire dans 15 minutes.`
  })
},

  // Dans votre livreurController.js, ajoutez cette méthode
async debugTokens(req, res) {
  try {
    const livreurs = await prisma.livreur.findMany({
      select: {
        id: true,
        username: true,
        disponible: true,
        pushToken: true
      }
    });

    const stats = {
      total: livreurs.length,
      disponibles: livreurs.filter(l => l.disponible).length,
      avecToken: livreurs.filter(l => l.pushToken).length,
      disponiblEtToken: livreurs.filter(l => l.disponible && l.pushToken).length
    };

    console.log('📊 Stats tokens:', stats);

    res.json({
      success: true,
      stats,
      livreurs: livreurs.map(l => ({
        id: l.id,
        username: l.username,
        disponible: l.disponible,
        hasToken: !!l.pushToken,
        tokenPreview: l.pushToken ? l.pushToken.substring(0, 20) + '...' : null
      }))
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},

  // 📍 API : Mettre à jour la position du livreur
 async updatePositionLivreur (req, res) {
  try {
    const { livreurId, latitude, longitude } = req.body;

    await prisma.livreur.update({
      where: { id: parseInt(livreurId) },
      data: {
        positionActuelle: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          timestamp: new Date().toISOString()
        }
      }
    });

    res.json({
      success: true,
      message: 'Position mise à jour'
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour position:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la position'
    });
  }
},

async getStatsLivreur (req, res) {
  try {
    const { id } = req.params;
    const livreurId = parseInt(id);

    // Calculer le nombre total de livraisons
    const totalLivraisons = await prisma.livraison.count({
      where: {
        livreurId: livreurId,
        status: 'LIVREE'
      }
    });

    // Calculer les gains du jour (aujourd'hui)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const gainsJour = await prisma.livraison.aggregate({
      where: {
        livreurId: livreurId,
        status: 'LIVREE',
        heureLivraison: {
          gte: today,
          lt: tomorrow
        }
      },
      _sum: {
        // Assuming you have a 'montant' field in livraison table
        // If not, you can calculate from commande.prix
      }
    });

    // Alternative: Calculer gains via les commandes
    const gainsJourCommandes = await prisma.commande.aggregate({
      where: {
        livraison: {
          livreurId: livreurId,
          status: 'LIVREE',
          heureLivraison: {
            gte: gainsJour._sum.heureLivraison,
            lt: tomorrow
          }
        }
      },
      _sum: {
        prix: true
      }
    });

    // Calculer les gains de la semaine
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const gainsSeaineCommandes = await prisma.commande.aggregate({
      where: {
        livraison: {
          livreurId: livreurId,
          status: 'LIVREE',
          heureLivraison: {
            gte: startOfWeek,
            lt: tomorrow
          }
        }
      },
      _sum: {
        prix: true
      }
    });

    // Calculer les gains du mois
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const gainsMoisCommandes = await prisma.commande.aggregate({
      where: {
        livraison: {
          livreurId: livreurId,
          status: 'LIVREE',
          heureLivraison: {
            gte: startOfMonth,
            lt: tomorrow
          }
        }
      },
      _sum: {
        prix: true
      }
    });

    // Calculer la note moyenne (si vous avez un système de notation)
    // const notemoyenne = await prisma.evaluation.aggregate({
    //   where: { livreurId: livreurId },
    //   _avg: { note: true }
    // });

    const stats = {
      totalLivraisons: totalLivraisons || 0,
      note: 5.0, // notemoyenne?._avg?.note || 5.0,
      gainsJour: gainsJourCommandes._sum?.prix || 0,
      gainsSemaine: gainsSeaineCommandes._sum?.prix || 0,
      gainsMois: gainsMoisCommandes._sum?.prix || 0,
    };

    console.log(`📊 Stats livreur ${livreurId}:`, stats);

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('❌ Erreur récupération stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      stats: {
        totalLivraisons: 0,
        note: 5.0,
        gainsJour: 0,
        gainsSemaine: 0,
        gainsMois: 0,
      }
    });
  }
},

// POST /api/livreur/register-push-token
async postRegisterPushToken (req, res) {
  try {
    const { livreurId, pushToken } = req.body;

    if (!livreurId || !pushToken) {
      return res.status(400).json({
        success: false,
        message: 'livreurId et pushToken requis'
      });
    }

    // Mettre à jour le token push du livreur
    const livreur = await prisma.livreur.update({
      where: { id: parseInt(livreurId) },
      data: { 
        pushToken: pushToken,
        updatedAt: new Date()
      }
    });

    console.log(`📱 Token push enregistré pour livreur ${livreurId}: ${pushToken.slice(0, 20)}...`);

    res.json({
      success: true,
      message: 'Token push enregistré avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur enregistrement token push:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement du token push'
    });
  }
},

// PUT /api/commandes/livreur/location
async updatePositionLivreurCommande (req, res) {
  try {
    const { livreurId, latitude, longitude } = req.body;

    if (!livreurId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'livreurId, latitude et longitude requis'
      });
    }

    // Mettre à jour la position du livreur
    await prisma.livreur.update({
      where: { id: parseInt(livreurId) },
      data: {
        positionActuelle: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          timestamp: new Date().toISOString()
        },
        updatedAt: new Date()
      }
    });

    // Log moins verbeux pour éviter le spam
    // console.log(`📍 Position livreur ${livreurId} mise à jour`);

    res.json({
      success: true,
      message: 'Position mise à jour'
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour position:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la position'
    });
  }
},

// Dans votre livreurController.js

// Mettre à jour le statut d'un livreur (disponibilité, position, etc.)
async updateLivreurStatus(req, res) {
  try {
    const { 
      livreurId, 
      disponible, 
      positionActuelle, 
      pushToken, 
      deviceId 
    } = req.body;

    console.log('🔄 Mise à jour statut livreur:', {
      livreurId,
      disponible,
      positionActuelle: !!positionActuelle,
      pushToken: !!pushToken,
      deviceId: !!deviceId
    });

    // Validation des champs requis
    if (!livreurId) {
      return res.status(400).json({
        message: 'ID du livreur requis'
      });
    }

    // Vérifier si le livreur existe
    const existingLivreur = await prisma.livreur.findUnique({
      where: { id: parseInt(livreurId) }
    });

    if (!existingLivreur) {
      return res.status(404).json({
        message: 'Livreur non trouvé'
      });
    }

    // Préparer les données à mettre à jour
    const updateData = {};
    
    // Mise à jour de la disponibilité
    if (typeof disponible === 'boolean') {
      updateData.disponible = disponible;
      console.log(`📱 Disponibilité: ${disponible ? 'EN LIGNE' : 'HORS LIGNE'}`);
    }

    // Mise à jour de la position
    if (positionActuelle && positionActuelle.latitude && positionActuelle.longitude) {
      updateData.positionActuelle = {
        latitude: parseFloat(positionActuelle.latitude),
        longitude: parseFloat(positionActuelle.longitude),
        timestamp: new Date().toISOString()
      };
      console.log('📍 Position mise à jour:', updateData.positionActuelle);

      // Ajouter dans l'historique des positions si on a une nouvelle position
      try {
        await prisma.historiquePosition.create({
          data: {
            livreurId: parseInt(livreurId),
            latitude: parseFloat(positionActuelle.latitude),
            longitude: parseFloat(positionActuelle.longitude)
          }
        });
        console.log('✅ Position ajoutée à l\'historique');
      } catch (historyError) {
        console.warn('⚠️ Erreur ajout historique position:', historyError);
        // Ne pas faire échouer la requête principale
      }
    }

    // Mise à jour du push token
    if (pushToken) {
      updateData.pushToken = pushToken;
      console.log('🔔 Push token mis à jour');
    }

    // Mise à jour du device ID
    if (deviceId) {
      updateData.deviceId = deviceId;
      console.log('📱 Device ID mis à jour');
    }

    // Vérifier qu'il y a au moins une donnée à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'Aucune donnée à mettre à jour'
      });
    }

    // Mettre à jour le livreur
    const updatedLivreur = await prisma.livreur.update({
      where: { id: parseInt(livreurId) },
      data: updateData,
      select: {
        id: true,
        username: true,
        prenom: true,
        email: true,
        telephone: true,
        disponible: true,
        positionActuelle: true,
        updatedAt: true,
        typeVehicule: true,
        note: true,
        totalLivraisons: true
      }
    });

    console.log('✅ Statut livreur mis à jour:', updatedLivreur.username);

    res.status(200).json({
      message: 'Statut mis à jour avec succès',
      livreur: updatedLivreur,
      updates: Object.keys(updateData)
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour statut:', error);
    handleServerError(res, error);
  }
},

// Méthode bonus : Obtenir le statut actuel d'un livreur
async getLivreurStatus(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'ID du livreur requis'
      });
    }

    const livreur = await prisma.livreur.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        prenom: true,
        disponible: true,
        positionActuelle: true,
        pushToken: true,
        deviceId: true,
        updatedAt: true,
        typeVehicule: true,
        note: true,
        totalLivraisons: true,
        // Inclure les livraisons en cours
        livraisons: {
          where: {
            // Adapter selon votre modèle de livraison
            // statut: 'EN_COURS' // par exemple
          },
          select: {
            id: true,
            createdAt: true
            // Autres champs selon votre modèle
          }
        }
      }
    });

    if (!livreur) {
      return res.status(404).json({
        message: 'Livreur non trouvé'
      });
    }

    res.status(200).json({
      message: 'Statut récupéré avec succès',
      livreur: {
        ...livreur,
        isOnline: livreur.disponible,
        hasActiveDeliveries: livreur.livraisons.length > 0,
        lastUpdate: livreur.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération statut:', error);
    handleServerError(res, error);
  }
},

// Méthode bonus : Mettre à jour seulement la disponibilité (plus simple)
async toggleLivreurDisponibilite(req, res) {
  try {
    const { id } = req.params;
    const { disponible } = req.body;

    if (typeof disponible !== 'boolean') {
      return res.status(400).json({
        message: 'Le champ disponible doit être un booléen (true/false)'
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

    console.log(`🔄 ${updatedLivreur.username} est maintenant ${disponible ? 'DISPONIBLE' : 'INDISPONIBLE'}`);

    res.status(200).json({
      message: `Livreur ${disponible ? 'activé' : 'désactivé'} avec succès`,
      livreur: updatedLivreur
    });

  } catch (error) {
    console.error('❌ Erreur toggle disponibilité:', error);
    handleServerError(res, error);
  }
},


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
  // async getAllLivreur(req, res) {
  //   try {
  //     const livreurs = await prisma.livreur.findMany({
  //       select: {
  //         id: true,
  //         username: true,
  //         prenom: true,
  //         email: true,
  //         telephone: true,
  //         image: true,
  //         disponible: true,
  //         note: true,
  //         totalLivraisons: true,
  //         createdAt: true,
  //         updatedAt: true,
  //         typeVehicule: true,
  //         plaqueVehicule: true,
  //         positionActuelle: true,
  //         // Relations
  //         livraisons: {
  //           select: {
  //             id: true,
  //             status: true,
  //             livreurId: true,
  //             createdAt: true,
  //             updatedAt: true
  //           }
  //         }
  //       }
  //     });

  //     res.status(200).json({
  //       message: 'Livreurs récupérés avec succès',
  //       livreurs,
  //       count: livreurs.length
  //     });
  //   } catch (error) {
  //     handleServerError(res, error);
  //   }
  // },
  async getAllLivreur(req, res) {
  try {
    const livreurs = await prisma.livreur.findMany({
      // select: {
      //   id: true,
      //   username: true,
      //   prenom: true,
      //   email: true,
      //   telephone: true,
      //   image: true,
      //   disponible: true,
      //   note: true,
      //   totalLivraisons: true,
      //   createdAt: true,
      //   updatedAt: true,
      //   typeVehicule: true,
      //   plaqueVehicule: true,
      //   positionActuelle: true, // tu peux retirer si tu doutes
      //   livraisons: {
      //     select: {
      //       id: true,
      //       heureLivraison: true,
      //       status: true,
      //       createdAt: true,
      //     }
      //   }
      // }
    });

    res.status(200).json({
      message: 'Livreurs récupérés avec succès',
      livreurs,
      count: livreurs.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
      meta: error.meta
    });
  }
},

  async getLivreurById(req, res) {
    try {
      const { id } = req.params;
      const livreur = await prisma.livreur.findUnique({
        where: { id: parseInt(id) }
      });
      if (!livreur) {
        return res.status(404).json({ 
          message: 'Livreur non trouvé' 
        });
      }
      res.status(200).json(livreur);
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