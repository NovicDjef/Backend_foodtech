import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 📱 Fonction pour notifier le client
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

export default  {

// controllers/livraisonController.js

async postNouvelleLivraison(req, res) {
  try {
    const { livreurId, userId, commandeId, colisId, status } = req.body;

    if (!livreurId || !userId) {
      return res.status(400).json({ message: '❌ livreurId et userId sont requis' });
    }

    // 1. Vérifier l'existence du livreur
    const livreurExiste = await prisma.livreur.findUnique({
      where: { id: parseInt(livreurId) }
    });
    if (!livreurExiste) {
      return res.status(404).json({ message: 'Livreur non trouvé' });
    }

    // 2. Vérifier l'existence du client (user)
    const userExiste = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });
    if (!userExiste) {
      return res.status(404).json({ message: 'Utilisateur client non trouvé' });
    }

    // 3. Créer la livraison
    const livraison = await prisma.livraison.create({
      data: {
        livreurId: parseInt(livreurId),
        userId: parseInt(userId),
        commandeId: commandeId ? parseInt(commandeId) : undefined,
        colisId: colisId ? parseInt(colisId) : undefined,
        status: status || 'ASSIGNEE',
      },
      include: {
        livreur: {
          select: { username: true, prenom: true, telephone: true }
        },
        user: {
          select: { username: true, phone: true }
        },
        commande: {
          include: {
            plat: true
          }
        },
        colis: true,
        historiquePositions: true,
        serviceLivraison: true
      }
    });

    res.status(201).json({
      success: true,
      message: '📦 Livraison créée avec succès',
      livraison
    });

  } catch (error) {
    console.error('❌ Erreur création livraison:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de la livraison",
      details: error.message
    });
  }
},



    // ✅ API : Livreur accepte une commande
async postLivraisonAsAccepted (req, res) {
  try {
    const { commandeId, livreurId } = req.body;

    // 1. Vérifier que la commande est toujours disponible
    const commande = await prisma.commande.findUnique({
      where: { id: parseInt(commandeId) },
      include: {
        user: { select: { username: true, phone: true } },
       plat: {
                include: {
                categorie: {
                    include: {
                    menu: {
                        include: {
                        restaurant: {
                            select: {
                            name: true,
                            adresse: true,
                            latitude: true,
                            longitude: true
                            }
                        }
                        }
                    }
                    }
                }
                }
            
            }
      }
    });

    if (!commande) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    if (commande.status !== 'EN_ATTENTE') {
      return res.status(409).json({
        success: false,
        message: 'Commande déjà prise par un autre livreur'
      });
    }

    // 2. Créer la livraison et assigner le livreur
    const livraison = await prisma.livraison.create({
      data: {
        commandeId: parseInt(commandeId),
        livreurId: parseInt(livreurId),
        status: {
          in: ['ASSIGNEE', 'EN_ROUTE'] // Statuts actifs
        },
        heureAssignation: new Date()
      }
    });

    // 3. Mettre à jour le statut de la commande
    await prisma.commande.update({
      where: { id: parseInt(commandeId) },
      data: { 
        status: 'EN_ROUTE',
        livraisonId: livraison.id 
      }
    });

    // 4. Marquer le livreur comme occupé
    await prisma.livreur.update({
      where: { id: parseInt(livreurId) },
      data: { disponible: false }
    });

    // 5. 📱 Notifier le CLIENT que sa commande est prise
    if (commande.user.pushToken) {
      await notifyClient(commande.user.pushToken, {
        title: "🚚 Livreur assigné !",
        body: "Votre commande est maintenant en cours de traitement",
        commandeId: commandeId
      });
    }

    // 6. Récupérer les détails complets pour le livreur
    const livraisonComplete = await prisma.livraison.findUnique({
      where: { id: livraison.id },
     include: {
  Commande: {
    include: {
      user: {
        select: {
          id: true,
          username: true,
          phone: true
        }
      },
      plat: {
        include: {
          restaurant: {
            select: {
              name: true,
              address: true,
              latitude: true,
              longitude: true,
              telephone: true
            }
          }
        }
      }
    }
  },
  livreur: {
    select: {
      id: true,
      username: true,
      prenom: true,
      telephone: true
    }
  },
  historiquePositions: true,
  serviceLivraison: true,
  colis: true
}

    });

    res.json({
      success: true,
      message: 'Commande acceptée avec succès',
      livraison: livraisonComplete
    });

  } catch (error) {
    console.error('❌ Erreur acceptation commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'acceptation de la commande'
    });
  }
},

// ❌ API : Livreur refuse une commande
async postLivraisonAsRejected (req, res) {
  try {
    const { commandeId, livreurId } = req.body;

    // Log du refus (optionnel pour analytics)
    console.log(`📝 Livreur ${livreurId} a refusé la commande ${commandeId}`);

    res.json({
      success: true,
      message: 'Commande refusée'
    });

  } catch (error) {
    console.error('❌ Erreur refus commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du refus de la commande'
    });
  }
},

// 🏁 API : Marquer commande comme livrée
 async postLivraisonAsDelivered (req, res) {
  try {
    const { livraisonId, livreurId } = req.body;

    // 1. Mettre à jour la livraison
    const livraison = await prisma.livraison.update({
      where: { id: parseInt(livraisonId) },
      data: {
        status: 'LIVREE',
        heureLivraison: new Date()
      },
      include: {
        commande: {
          include: {
            user: { select: { pushToken: true } }
          }
        }
      }
    });

    // 2. Mettre à jour le statut de la commande
    await prisma.commande.update({
      where: { id: livraison.commandeId },
      data: { status: 'LIVREE' }
    });

    // 3. Libérer le livreur
    await prisma.livreur.update({
      where: { id: parseInt(livreurId) },
      data: { disponible: true }
    });

    // 4. 📱 Notifier le client de la livraison
    if (livraison.commande.user.pushToken) {
      await notifyClient(livraison.commande.user.pushToken, {
        title: "🎉 Commande livrée !",
        body: "Votre commande a été livrée avec succès. Bon appétit !",
        commandeId: livraison.commandeId
      });
    }

    res.json({
      success: true,
      message: 'Commande marquée comme livrée',
      livraison
    });

  } catch (error) {
    console.error('❌ Erreur livraison:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation de livraison'
    });
  }
},

// GET /api/livraisons/active/:livreurId
async getLivraisonsActive (req, res) {
  try {
    const { livreurId } = req.params;

    const activeLivraisons = await prisma.livraison.findMany({
      where: {
        livreurId: parseInt(livreurId),
        status: {
          in: ['ASSIGNEE', 'EN_ROUTE'] // Statuts actifs
        }
      },
      include: {
        commande: {
          include: {
            user: {
              select: { id: true, username: true, phone: true }
            },
            plat: {
                include: {
                categorie: {
                    include: {
                    menu: {
                        include: {
                        restaurant: {
                            select: {
                            name: true,
                            adresse: true,
                            latitude: true,
                            longitude: true
                            }
                        }
                        }
                    }
                    }
                }
                }
            
            }

          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📋 ${activeLivraisons.length} livraisons actives pour livreur ${livreurId}`);

    res.json({
      success: true,
      livraisons: activeLivraisons
    });

  } catch (error) {
    console.error('❌ Erreur livraisons actives:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des livraisons actives',
      livraisons: []
    });
  }
},

// GET /api/livraisons/historique/:livreurId?period=week|month|all
async getLivraisonsHistorique(req, res) {
  try {
    const { livreurId } = req.params;
    const { period = 'month' } = req.query;
    
    console.log(`📜 Récupération historique pour livreur ${livreurId}, période: ${period}`);
    
    const livreurIdInt = parseInt(livreurId);
    if (isNaN(livreurIdInt)) {
      return res.status(400).json({ 
        success: false, 
        message: 'livreurId invalide',
        livraisons: []
      });
    }

    // ✅ Calculer la date de début selon la période
    let dateDebut = new Date();
    switch (period) {
      case 'week':
      case '7':
        dateDebut.setDate(dateDebut.getDate() - 7);
        break;
      case 'month':
      case '30':
        dateDebut.setMonth(dateDebut.getMonth() - 1);
        break;
      case 'all':
        dateDebut = new Date('2020-01-01'); // Date très ancienne
        break;
      default:
        // Si c'est un nombre de jours
        const days = parseInt(period);
        if (!isNaN(days)) {
          dateDebut.setDate(dateDebut.getDate() - days);
        } else {
          dateDebut.setMonth(dateDebut.getMonth() - 1);
        }
    }

    console.log(`📅 Recherche depuis le: ${dateDebut.toISOString()}`);

    // ✅ CORRECTION PRINCIPALE: Chercher les livraisons TERMINEES (LIVREE)
    const historiqueLivraisons = await prisma.livraison.findMany({
      where: {
        livreurId: livreurIdInt,
        status: "LIVREE", // ✅ CORRECTION: Seulement les livraisons terminées
        heureLivraison: {
          gte: dateDebut,
          lte: new Date() // ✅ Pas de livraisons futures
        }
      },
      include: {
        commande: {
          include: {
            user: {
              select: { id: true, username: true, phone: true }
            },
            plat: {
              include: {
                categorie: {
                  include: {
                    menu: {
                      include: {
                        restaurant: {
                          select: { name: true, adresse: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        heureLivraison: 'desc' // Les plus récentes en premier
      },
      take: 100 // ✅ Augmenté la limite pour l'historique
    });

    console.log(`📚 ${historiqueLivraisons.length} livraisons trouvées dans l'historique (${period}) pour livreur ${livreurId}`);
    
    // ✅ Debug des données retournées
    if (historiqueLivraisons.length > 0) {
      console.log("🔍 Première livraison exemple:", {
        id: historiqueLivraisons[0].id,
        status: historiqueLivraisons[0].status,
        heureLivraison: historiqueLivraisons[0].heureLivraison,
        commandeId: historiqueLivraisons[0].commande?.id
      });
    }

    res.json({
      success: true,
      livraisons: historiqueLivraisons,
      period: period,
      total: historiqueLivraisons.length,
      dateDebut: dateDebut.toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur historique livraisons:', error);
    console.error('❌ Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      livraisons: [],
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},


// 📋 API : Récupérer les détails d'une livraison pour le livreur
async getDetailsLivraison (req, res) {
  try {
    const { id } = req.params;

    const livraison = await prisma.livraison.findUnique({
      where: { id: parseInt(id) },
      // include: {
      //   commande: {
      //     include: {
      //       user: {
      //         select: { name: true, email: true }
      //       },
      //       plat: {
      //         include: {
      //           restaurant: {
      //             select: { name: true, address: true, latitude: true, longitude: true }
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
    });

    if (!livraison) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    res.json({
      success: true,
      livraison
    });

  } catch (error) {
    console.error('❌ Erreur récupération livraison:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails'
    });
  }
},

// GET /api/commandes/livraison/:id
async getCommandeLivraison (req, res) {
  try {
    const { id } = req.params;

    const livraison = await prisma.livraison.findUnique({
      where: { id: parseInt(id) },
      include: {
        commande: {
          include: {
            user: {
              select: { id: true, username: true, phone: true }
            },
            plat: {
              include: {
                restaurant: {
                  select: { 
                    name: true, 
                    address: true, 
                    latitude: true, 
                    longitude: true,
                    telephone: true
                  }
                }
              }
            }
          }
        },
        livreur: {
          select: { id: true, username: true, prenom: true, telephone: true }
        }
      }
    });

    if (!livraison) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    console.log(`📦 Détails livraison ${id} récupérés`);

    res.json({
      success: true,
      livraison: livraison
    });

  } catch (error) {
    console.error('❌ Erreur détails livraison:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails'
    });
  }
},

  async getLivraisonsTracking(req, res) {
        try {
        const { commandeId } = req.params;

        // Récupérer la commande avec les informations de livraison
        const commande = await prisma.commande.findUnique({
            where: { id: parseInt(commandeId) },
            include: {
                livraison: {
                    include: {
                        livreur: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true,
                                telephone: true,
                                photo: true,
                                positionActuelle: true
                            }
                        }
                    }
                },
                plat: {
                    include: {
                        restaurant: {
                            select: {
                                name: true,
                                latitude: true,
                                longitude: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        name: true,
                        telephone: true
                    }
                }
            }
        });

        if (!commande) {
            return res.status(404).json({
                success: false,
                message: "Commande non trouvée"
            });
        }

        // Calculer le temps estimé basé sur la distance
        let tempsEstime = null;
        if (commande.livraison?.livreur?.positionActuelle && commande.position) {
            tempsEstime = await calculateEstimatedTime(
                commande.livraison.livreur.positionActuelle,
                commande.position
            );
        }

        res.json({
            success: true,
            livraison: {
                id: commande.livraison?.id,
                status: commande.status,
                livreur: commande.livraison?.livreur,
                positionActuelle: commande.livraison?.livreur?.positionActuelle,
                tempsEstime: tempsEstime,
                restaurant: commande.plat.restaurant,
                commande: {
                    id: commande.id,
                    quantity: commande.quantity,
                    prix: commande.prix,
                    recommandation: commande.recommandation,
                    plat: commande.plat
                }
            }
        });

    } catch (error) {
        console.error('Erreur récupération tracking:', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la récupération du suivi"
        });
    }
  },

  async updateLivraison(req, res) {
    try {
        const { livreurId } = req.params;
        const { latitude, longitude } = req.body;

        // Mettre à jour la position du livreur
        const livreur = await prisma.livreur.update({
            where: { id: parseInt(livreurId) },
            data: {
                positionActuelle: {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    timestamp: new Date()
                }
            }
        });

        // Récupérer les livraisons actives de ce livreur
        const livraisonsActives = await prisma.livraison.findMany({
            where: {
                livreurId: parseInt(livreurId),
                status: { in: ['ASSIGNEE', 'EN_ROUTE'] }
            },
            include: {
                commande: {
                    include: {
                        user: { select: { id: true, fcmToken: true } }
                    }
                }
            }
        });

        // Envoyer des notifications push aux clients concernés
        for (const livraison of livraisonsActives) {
            await sendPositionUpdateNotification(
                livraison.commande.user.fcmToken,
                { latitude, longitude }
            );
        }

        res.json({
            success: true,
            message: "Position mise à jour avec succès",
            position: { latitude, longitude }
        });

    } catch (error) {
        console.error('Erreur mise à jour position:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour de la position"
        });
    }
  },

  async assignleLivraison(req, res) {
    try {
        const { commandeId } = req.body;

        // Récupérer la commande avec le restaurant
        const commande = await prisma.commande.findUnique({
            where: { id: parseInt(commandeId) },
            include: {
                plat: {
                    include: {
                        restaurant: true
                    }
                }
            }
        });

        if (!commande) {
            return res.status(404).json({
                success: false,
                message: "Commande non trouvée"
            });
        }

        // Trouver le livreur disponible le plus proche
        const livreurs = await prisma.livreur.findMany({
            where: {
                disponible: true,
                positionActuelle: { not: null }
            }
        });

        if (livreurs.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Aucun livreur disponible"
            });
        }

        // Calculer le livreur le plus proche
        const restaurantPos = {
            latitude: commande.plat.restaurant.latitude,
            longitude: commande.plat.restaurant.longitude
        };

        let livreurPlusProche = null;
        let distanceMin = Infinity;

        for (const livreur of livreurs) {
            const distance = calculateDistance(
                restaurantPos,
                livreur.positionActuelle
            );
            
            if (distance < distanceMin) {
                distanceMin = distance;
                livreurPlusProche = livreur;
            }
        }

        if (!livreurPlusProche) {
            return res.status(400).json({
                success: false,
                message: "Aucun livreur disponible à proximité"
            });
        }

        // Créer la livraison et assigner le livreur
        const livraison = await prisma.livraison.create({
            data: {
                commandeId: parseInt(commandeId),
                livreurId: livreurPlusProche.id,
                status: 'ASSIGNEE',
                tempsEstime: Math.ceil(distanceMin * 2) // estimation simple
            }
        });

        // Mettre à jour le statut de la commande
        await prisma.commande.update({
            where: { id: parseInt(commandeId) },
            data: { 
                status: 'ASSIGNEE',
                livraisonId: livraison.id 
            }
        });

        // Marquer le livreur comme indisponible
        await prisma.livreur.update({
            where: { id: livreurPlusProche.id },
            data: { disponible: false }
        });

        // Envoyer notification au livreur
        await sendNotificationToLivreur(livreurPlusProche.id, {
            title: "Nouvelle commande",
            body: `Commande #${commandeId} vous a été assignée`,
            data: { commandeId: commandeId.toString() }
        });

        // Envoyer notification au client
        await sendNotificationToClient(commande.userId, {
            title: "Livreur assigné",
            body: `${livreurPlusProche.prenom} ${livreurPlusProche.nom} a été assigné à votre commande`,
            data: { commandeId: commandeId.toString() }
        });

        res.json({
            success: true,
            message: "Livreur assigné avec succès",
            livraison: {
                ...livraison,
                livreur: livreurPlusProche
            }
        });

    } catch (error) {
        console.error('Erreur assignation livreur:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'assignation du livreur"
        });
    }
},
















  // // Créer une nouvelle livraison
  // async createLivraison(req, res) {
  //   try {
  //     const { type, statut, adresseDepart, adresseArrivee, commandeId, colisId, serviceLivraisonId } = req.body;
      
  //     const newLivraison = await prisma.livraison.create({
  //       data: {
  //         type,
  //         statut,
  //         adresseDepart,
  //         adresseArrivee,
  //         dateLivraison: new Date(),
  //         commande: commandeId ? { connect: { id: parseInt(commandeId) } } : undefined,
  //         colis: colisId ? { connect: { id: parseInt(colisId) } } : undefined,
  //         serviceLivraison: serviceLivraisonId ? { connect: { id: parseInt(serviceLivraisonId) } } : undefined,
  //       },
  //       include: {
  //         commande: true,
  //         colis: true,
  //         serviceLivraison: true,
  //       },
  //     });

  //     res.status(201).json({
  //       message: "Livraison créée avec succès",
  //       livraison: newLivraison
  //     });
  //   } catch (error) {
  //     handleServerError(res, error);
  //   }
  // },

  // // Obtenir toutes les livraisons
  // async getAllLivraisons(req, res) {
  //   try {
  //     const livraisons = await prisma.livraison.findMany({
  //       include: {
  //         commande: true,
  //         colis: true,
  //         serviceLivraison: true,
  //       }
  //     });

  //     res.status(200).json(livraisons);
  //   } catch (error) {
  //     handleServerError(res, error);
  //   }
  // },

  // // Obtenir une livraison par son ID
  // async getLivraisonById(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const livraison = await prisma.livraison.findUnique({
  //       where: { id: parseInt(id) },
  //       include: {
  //         commande: true,
  //         colis: true,
  //         serviceLivraison: true,
  //       }
  //     });

  //     if (!livraison) {
  //       return res.status(404).json({ message: "Livraison non trouvée" });
  //     }

  //     res.status(200).json(livraison);
  //   } catch (error) {
  //     handleServerError(res, error);
  //   }
  // },

  // // Mettre à jour une livraison
  // // async updateLivraison(req, res) {
  // //   try {
  // //     const { id } = req.params;
  // //     const { statut, adresseDepart, adresseArrivee, serviceLivraisonId } = req.body;

  // //     const updatedLivraison = await prisma.livraison.update({
  // //       where: { id: parseInt(id) },
  // //       data: {
  // //         statut,
  // //         adresseDepart,
  // //         adresseArrivee,
  // //         serviceLivraison: serviceLivraisonId ? 
  // //           { connect: { id: parseInt(serviceLivraisonId) } } : undefined,
  // //       },
  // //       include: {
  // //         commande: true,
  // //         colis: true,
  // //         serviceLivraison: true,
  // //       },
  // //     });

  // //     res.status(200).json({
  // //       message: "Livraison mise à jour avec succès",
  // //       livraison: updatedLivraison
  // //     });
  // //   } catch (error) {
  // //     handleServerError(res, error);
  // //   }
  // // },

  // // Supprimer une livraison
  // async deleteLivraison(req, res) {
  //   try {
  //     const { id } = req.params;

  //     await prisma.livraison.delete({
  //       where: { id: parseInt(id) }
  //     });

  //     res.status(200).json({ message: "Livraison supprimée avec succès" });
  //   } catch (error) {
  //     handleServerError(res, error);
  //   }
  // },

  // // Obtenir les livraisons par statut
  // async getLivraisonsByStatus(req, res) {
  //   try {
  //     const { statut } = req.params;
  //     const livraisons = await prisma.livraison.findMany({
  //       where: { statut },
  //       include: {
  //         commande: true,
  //         colis: true,
  //         serviceLivraison: true,
  //       }
  //     });

  //     res.status(200).json(livraisons);
  //   } catch (error) {
  //     handleServerError(res, error);
  //   }
  // },

  // // Obtenir les livraisons par service de livraison
  // async getLivraisonsByService(req, res) {
  //   try {
  //     const { serviceLivraisonId } = req.params;
  //     const livraisons = await prisma.livraison.findMany({
  //       where: { serviceLivraisonId: parseInt(serviceLivraisonId) },
  //       include: {
  //         commande: true,
  //         colis: true,
  //         serviceLivraison: true,
  //       }
  //     });

  //     res.status(200).json(livraisons);
  //   } catch (error) {
  //     handleServerError(res, error);
  //   }
  // },

  // // Mettre à jour le statut d'une livraison
  // async updateLivraisonStatus(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const { statut } = req.body;

  //     const updatedLivraison = await prisma.livraison.update({
  //       where: { id: parseInt(id) },
  //       data: { statut },
  //       include: {
  //         commande: true,
  //         colis: true,
  //         serviceLivraison: true,
  //       },
  //     });

  //     res.status(200).json({
  //       message: "Statut de la livraison mis à jour avec succès",
  //       livraison: updatedLivraison
  //     });
  //   } catch (error) {
  //     handleServerError(res, error);
  //   }
  // },
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}







// Fonctions utilitaires
function calculateDistance(pos1, pos2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance en km
}

 async function calculateEstimatedTime(startPos, endPos) {
    // Intégration avec Google Directions API pour un calcul précis
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${startPos.latitude},${startPos.longitude}&destination=${endPos}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            return data.routes[0].legs[0].duration.text;
        }
        
        return "15-20 min"; // Estimation par défaut
    } catch (error) {
        console.error('Erreur calcul temps:', error);
        return "15-20 min";
    }
}

 function sendPositionUpdateNotification(fcmToken, position) {
    // Implémentation avec Firebase Admin SDK
    // À adapter selon votre système de notifications
}

 function sendNotificationToLivreur(livreurId, notification) {
    // Implémentation notification livreur
}

 function sendNotificationToClient(userId, notification) {
    // Implémentation notification client
}

function generateOTP() {
    const otpLength = 5; // Longueur du code OTP
    const digits = '0123456789'; // Caractères autorisés pour le code OTP
    let code = '';
    for (let i = 0; i < otpLength; i++) {
        code += digits[Math.floor(Math.random() * 10)]; // Sélection aléatoire d'un chiffre
    }
    return code;
}


