import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default  {

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
                status: { in: ['ASSIGNEE', 'EN_COURS'] }
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


