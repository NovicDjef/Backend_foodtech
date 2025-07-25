import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  // ========================================
  // AVIS SUR LES VENDEURS
  // ========================================

  // Créer un avis sur un vendeur
  async createVendorReview(req, res) {
    try {
      const { userId, vendorId, rating, comment } = req.body;

      // Vérifier que l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) }
      });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Vérifier que le vendeur existe
      const vendor = await prisma.gasVendor.findUnique({
        where: { id: parseInt(vendorId) }
      });

      if (!vendor) {
        return res.status(404).json({ message: "Vendeur non trouvé" });
      }

      // Vérifier que l'utilisateur a déjà passé une commande chez ce vendeur
      const hasOrdered = await prisma.gasOrder.findFirst({
        where: {
          userId: parseInt(userId),
          vendorId: parseInt(vendorId),
          status: 'LIVREE'
        }
      });

      if (!hasOrdered) {
        return res.status(400).json({ 
          message: "Vous devez avoir passé une commande livrée chez ce vendeur pour laisser un avis" 
        });
      }

      // Créer l'avis (ou le mettre à jour s'il existe déjà)
      const review = await prisma.gasVendorReview.upsert({
        where: {
          userId_vendorId: {
            userId: parseInt(userId),
            vendorId: parseInt(vendorId)
          }
        },
        update: {
          rating: parseFloat(rating),
          comment
        },
        create: {
          userId: parseInt(userId),
          vendorId: parseInt(vendorId),
          rating: parseFloat(rating),
          comment
        },
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          },
          vendor: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        }
      });

      // Recalculer la note moyenne du vendeur
      await updateVendorRating(parseInt(vendorId));

      res.status(201).json({
        message: "Avis créé avec succès",
        review
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les avis d'un vendeur
  async getVendorReviews(req, res) {
    try {
      const { vendorId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [reviews, totalCount, averageRating] = await Promise.all([
        prisma.gasVendorReview.findMany({
          where: { vendorId: parseInt(vendorId) },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: parseInt(limit)
        }),
        prisma.gasVendorReview.count({
          where: { vendorId: parseInt(vendorId) }
        }),
        prisma.gasVendorReview.aggregate({
          where: { vendorId: parseInt(vendorId) },
          _avg: { rating: true }
        })
      ]);

      // Distribution des notes
      const ratingDistribution = await prisma.gasVendorReview.groupBy({
        by: ['rating'],
        where: { vendorId: parseInt(vendorId) },
        _count: { rating: true }
      });

      res.status(200).json({
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        },
        stats: {
          averageRating: averageRating._avg.rating || 0,
          totalReviews: totalCount,
          distribution: ratingDistribution.reduce((acc, item) => {
            acc[item.rating] = item._count.rating;
            return acc;
          }, {})
        }
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer un avis de vendeur
  async deleteVendorReview(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body; // Pour vérifier l'autorisation

      const review = await prisma.gasVendorReview.findUnique({
        where: { id: parseInt(id) }
      });

      if (!review) {
        return res.status(404).json({ message: "Avis non trouvé" });
      }

      // Vérifier que c'est l'utilisateur qui a créé l'avis ou un admin
      if (review.userId !== parseInt(userId)) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      await prisma.gasVendorReview.delete({
        where: { id: parseInt(id) }
      });

      // Recalculer la note moyenne du vendeur
      await updateVendorRating(review.vendorId);

      res.status(200).json({ message: "Avis supprimé avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // ========================================
  // AVIS SUR LES COMMANDES
  // ========================================

  // Créer un avis sur une commande
  async createOrderReview(req, res) {
    try {
      const { 
        userId, 
        orderId, 
        serviceRating, 
        qualityRating, 
        deliveryRating, 
        comment,
        wouldRecommend 
      } = req.body;

      // Vérifier que la commande existe et appartient à l'utilisateur
      const order = await prisma.gasOrder.findUnique({
        where: { id: parseInt(orderId) },
        include: { vendor: true }
      });

      if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }

      if (order.userId !== parseInt(userId)) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      if (order.status !== 'LIVREE') {
        return res.status(400).json({ 
          message: "Vous ne pouvez évaluer que les commandes livrées" 
        });
      }

      // Calculer la note globale
      const overallRating = (
        parseFloat(serviceRating) + 
        parseFloat(qualityRating) + 
        parseFloat(deliveryRating)
      ) / 3;

      // Créer l'avis
      const review = await prisma.gasOrderReview.create({
        data: {
          userId: parseInt(userId),
          orderId: parseInt(orderId),
          serviceRating: parseFloat(serviceRating),
          qualityRating: parseFloat(qualityRating),
          deliveryRating: parseFloat(deliveryRating),
          overallRating: parseFloat(overallRating.toFixed(1)),
          comment,
          wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true
        },
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              vendor: {
                select: {
                  id: true,
                  name: true,
                  location: true
                }
              }
            }
          }
        }
      });

      // Recalculer la note moyenne du vendeur en tenant compte de ce nouvel avis
      await updateVendorRating(order.vendorId);

      res.status(201).json({
        message: "Avis de commande créé avec succès",
        review
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir l'avis d'une commande
  async getOrderReview(req, res) {
    try {
      const { orderId } = req.params;

      const review = await prisma.gasOrderReview.findUnique({
        where: { orderId: parseInt(orderId) },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              vendor: {
                select: {
                  id: true,
                  name: true,
                  location: true
                }
              }
            }
          }
        }
      });

      if (!review) {
        return res.status(404).json({ message: "Aucun avis trouvé pour cette commande" });
      }

      res.status(200).json(review);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir tous les avis d'un utilisateur
  async getUserReviews(req, res) {
    try {
      const { userId } = req.params;
      const { type = 'all', page = 1, limit = 10 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      let vendorReviews = [];
      let orderReviews = [];

      if (type === 'all' || type === 'vendor') {
        vendorReviews = await prisma.gasVendorReview.findMany({
          where: { userId: parseInt(userId) },
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
                location: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'vendor' ? skip : 0,
          take: type === 'vendor' ? parseInt(limit) : undefined
        });
      }

      if (type === 'all' || type === 'order') {
        orderReviews = await prisma.gasOrderReview.findMany({
          where: { userId: parseInt(userId) },
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                vendor: {
                  select: {
                    id: true,
                    name: true,
                    location: true,
                    image: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'order' ? skip : 0,
          take: type === 'order' ? parseInt(limit) : undefined
        });
      }

      const totalCount = vendorReviews.length + orderReviews.length;

      res.status(200).json({
        vendorReviews,
        orderReviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour un avis de commande
  async updateOrderReview(req, res) {
    try {
      const { id } = req.params;
      const { 
        serviceRating, 
        qualityRating, 
        deliveryRating, 
        comment, 
        wouldRecommend,
        userId 
      } = req.body;

      // Vérifier l'autorisation
      const existingReview = await prisma.gasOrderReview.findUnique({
        where: { id: parseInt(id) },
        include: { order: true }
      });

      if (!existingReview) {
        return res.status(404).json({ message: "Avis non trouvé" });
      }

      if (existingReview.userId !== parseInt(userId)) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      // Calculer la nouvelle note globale
      const overallRating = (
        parseFloat(serviceRating) + 
        parseFloat(qualityRating) + 
        parseFloat(deliveryRating)
      ) / 3;

      const updatedReview = await prisma.gasOrderReview.update({
        where: { id: parseInt(id) },
        data: {
          serviceRating: parseFloat(serviceRating),
          qualityRating: parseFloat(qualityRating),
          deliveryRating: parseFloat(deliveryRating),
          overallRating: parseFloat(overallRating.toFixed(1)),
          comment,
          wouldRecommend
        },
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              vendor: {
                select: {
                  id: true,
                  name: true,
                  location: true
                }
              }
            }
          }
        }
      });

      // Recalculer la note moyenne du vendeur
      await updateVendorRating(existingReview.order.vendorId);

      res.status(200).json({
        message: "Avis mis à jour avec succès",
        review: updatedReview
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer un avis de commande
  async deleteOrderReview(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const review = await prisma.gasOrderReview.findUnique({
        where: { id: parseInt(id) },
        include: { order: true }
      });

      if (!review) {
        return res.status(404).json({ message: "Avis non trouvé" });
      }

      if (review.userId !== parseInt(userId)) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      await prisma.gasOrderReview.delete({
        where: { id: parseInt(id) }
      });

      // Recalculer la note moyenne du vendeur
      await updateVendorRating(review.order.vendorId);

      res.status(200).json({ message: "Avis supprimé avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les statistiques des avis d'un vendeur
  async getVendorReviewStats(req, res) {
    try {
      const { vendorId } = req.params;

      const [
        vendorReviews,
        orderReviews,
        averageVendorRating,
        averageOrderRating
      ] = await Promise.all([
        prisma.gasVendorReview.findMany({
          where: { vendorId: parseInt(vendorId) }
        }),
        prisma.gasOrderReview.findMany({
          where: {
            order: {
              vendorId: parseInt(vendorId)
            }
          }
        }),
        prisma.gasVendorReview.aggregate({
          where: { vendorId: parseInt(vendorId) },
          _avg: { rating: true }
        }),
        prisma.gasOrderReview.aggregate({
          where: {
            order: {
              vendorId: parseInt(vendorId)
            }
          },
          _avg: {
            serviceRating: true,
            qualityRating: true,
            deliveryRating: true,
            overallRating: true
          }
        })
      ]);

      // Distribution des notes vendeur
      const vendorRatingDistribution = vendorReviews.reduce((acc, review) => {
        const rating = Math.floor(review.rating);
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {});

      // Pourcentage de recommandations
      const recommendationRate = orderReviews.length > 0 
        ? (orderReviews.filter(r => r.wouldRecommend).length / orderReviews.length * 100).toFixed(1)
        : 0;

      const stats = {
        vendorReviews: {
          total: vendorReviews.length,
          averageRating: averageVendorRating._avg.rating || 0,
          distribution: vendorRatingDistribution
        },
        orderReviews: {
          total: orderReviews.length,
          averageServiceRating: averageOrderRating._avg.serviceRating || 0,
          averageQualityRating: averageOrderRating._avg.qualityRating || 0,
          averageDeliveryRating: averageOrderRating._avg.deliveryRating || 0,
          averageOverallRating: averageOrderRating._avg.overallRating || 0,
          recommendationRate: parseFloat(recommendationRate)
        },
        overall: {
          totalReviews: vendorReviews.length + orderReviews.length,
          recommendationRate: parseFloat(recommendationRate)
        }
      };

      res.status(200).json(stats);
    } catch (error) {
      handleServerError(res, error);
    }
  }
};

// Fonction utilitaire pour recalculer la note moyenne d'un vendeur
async function updateVendorRating(vendorId) {
  try {
    // Calculer la moyenne des avis directs du vendeur
    const vendorReviewsAvg = await prisma.gasVendorReview.aggregate({
      where: { vendorId },
      _avg: { rating: true }
    });

    // Calculer la moyenne des avis des commandes
    const orderReviewsAvg = await prisma.gasOrderReview.aggregate({
      where: {
        order: { vendorId }
      },
      _avg: { overallRating: true }
    });

    // Combiner les deux moyennes (pondération égale)
    let finalRating = 5.0; // Note par défaut

    if (vendorReviewsAvg._avg.rating && orderReviewsAvg._avg.overallRating) {
      finalRating = (vendorReviewsAvg._avg.rating + orderReviewsAvg._avg.overallRating) / 2;
    } else if (vendorReviewsAvg._avg.rating) {
      finalRating = vendorReviewsAvg._avg.rating;
    } else if (orderReviewsAvg._avg.overallRating) {
      finalRating = orderReviewsAvg._avg.overallRating;
    }

    // Mettre à jour la note du vendeur
    await prisma.gasVendor.update({
      where: { id: vendorId },
      data: { rating: parseFloat(finalRating.toFixed(1)) }
    });
  } catch (error) {
    console.error('Erreur mise à jour rating vendeur:', error);
  }
}

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}