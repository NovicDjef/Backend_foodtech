import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  // Créer une nouvelle commande de gaz
  async createGasOrder(req, res) {
    try {
      const { 
        userId,
        vendorId,
        phone,
        deliveryAddress,
        selectedBrand,
        hasRegulator,
        orderType,
        quantity,
        basePrice,
        deliveryPrice,
        specialInstructions,
        position,
        paymentMethod
      } = req.body;

      // Vérifier que le vendeur existe et est actif
      const vendor = await prisma.gasVendor.findUnique({
        where: { id: parseInt(vendorId) }
      });

      if (!vendor || !vendor.isActive) {
        return res.status(400).json({ 
          message: "Vendeur non disponible" 
        });
      }

      // Calculer les prix
      const subtotal = parseFloat(basePrice) * parseInt(quantity);
      const totalPrice = subtotal + parseFloat(deliveryPrice);

      const newOrder = await prisma.gasOrder.create({
        data: {
          userId: parseInt(userId),
          vendorId: parseInt(vendorId),
          phone,
          deliveryAddress,
          selectedBrand,
          hasRegulator,
          orderType,
          quantity: parseInt(quantity),
          basePrice: parseFloat(basePrice),
          subtotal,
          deliveryPrice: parseFloat(deliveryPrice),
          totalPrice,
          position,
          specialInstructions,
          paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
          status: 'GAS_PENDING',
          paymentStatus: 'GAS_PAYMENT_PENDING'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              phone: true
            }
          },
          vendor: {
            select: {
              id: true,
              name: true,
              location: true,
              phone: true,
              deliveryTime: true
            }
          },
          livreur: {
            select: {
              id: true,
              username: true,
              prenom: true,
              telephone: true
            }
          }
        }
      });

      // Mettre à jour le nombre total de commandes du vendeur
      await prisma.gasVendor.update({
        where: { id: parseInt(vendorId) },
        data: {
          totalOrders: {
            increment: 1
          }
        }
      });

      res.status(201).json({
        message: "Commande de gaz créée avec succès",
        order: newOrder
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir toutes les commandes de gaz
  async getAllGasOrders(req, res) {
    try {
      const { status, vendorId, userId, page = 1, limit = 20 } = req.query;
      
      const whereClause = {};
      
      if (status) {
        whereClause.status = status;
      }
      if (vendorId) {
        whereClause.vendorId = parseInt(vendorId);
      }
      if (userId) {
        whereClause.userId = parseInt(userId);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [orders, totalCount] = await Promise.all([
        prisma.gasOrder.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                phone: true
              }
            },
            vendor: {
              select: {
                id: true,
                name: true,
                location: true,
                phone: true
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
            review: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: parseInt(limit)
        }),
        prisma.gasOrder.count({
          where: whereClause
        })
      ]);

      res.status(200).json({
        orders,
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

  // Obtenir une commande par son ID
  async getGasOrderById(req, res) {
    try {
      const { id } = req.params;
      
      const order = await prisma.gasOrder.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              phone: true,
              avatar: true
            }
          },
          vendor: {
            include: {
              ville: true,
              admin: {
                select: {
                  id: true,
                  username: true,
                  email: true
                }
              }
            }
          },
          livreur: {
            select: {
              id: true,
              username: true,
              prenom: true,
              telephone: true,
              typeVehicule: true,
              plaqueVehicule: true
            }
          },
          review: true
        }
      });

      if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }

      res.status(200).json(order);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir une commande par son numéro
  async getGasOrderByNumber(req, res) {
    try {
      const { orderNumber } = req.params;
      
      const order = await prisma.gasOrder.findUnique({
        where: { orderNumber },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              phone: true
            }
          },
          vendor: true,
          livreur: {
            select: {
              id: true,
              username: true,
              prenom: true,
              telephone: true
            }
          },
          review: true
        }
      });

      if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }

      res.status(200).json(order);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, vendorNotes, deliveryNotes, estimatedDeliveryTime } = req.body;

      const updateData = { status };
      
      // Ajouter des timestamps selon le statut
      const now = new Date();
      switch (status) {
        case 'GAS_CONFIRMED':
          updateData.confirmedAt = now;
          break;
        case 'GAS_PREPARING':
          updateData.preparedAt = now;
          break;
        case 'GAS_OUT_FOR_DELIVERY':
          updateData.dispatchedAt = now;
          break;
        case 'GAS_DELIVERED':
          updateData.deliveredAt = now;
          updateData.paymentStatus = 'GAS_PAYMENT_PAID'; // Assumé payé à la livraison
          break;
        case 'GAS_CANCELLED':
          updateData.cancelledAt = now;
          break;
      }

      if (vendorNotes) updateData.vendorNotes = vendorNotes;
      if (deliveryNotes) updateData.deliveryNotes = deliveryNotes;
      if (estimatedDeliveryTime) updateData.estimatedDeliveryTime = estimatedDeliveryTime;

      const updatedOrder = await prisma.gasOrder.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              phone: true
            }
          },
          vendor: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          livreur: {
            select: {
              id: true,
              username: true,
              prenom: true
            }
          }
        }
      });

      res.status(200).json({
        message: "Statut de la commande mis à jour avec succès",
        order: updatedOrder
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Assigner un livreur à une commande
  async assignDeliveryPerson(req, res) {
    try {
      const { id } = req.params;
      const { livreurId } = req.body;

      // Vérifier que le livreur existe et est disponible
      const livreur = await prisma.livreur.findUnique({
        where: { id: parseInt(livreurId) }
      });

      if (!livreur || !livreur.disponible) {
        return res.status(400).json({ 
          message: "Livreur non disponible" 
        });
      }

      const updatedOrder = await prisma.gasOrder.update({
        where: { id: parseInt(id) },
        data: {
          livreurId: parseInt(livreurId),
          status: 'GAS_READY'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              phone: true
            }
          },
          vendor: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          livreur: {
            select: {
              id: true,
              username: true,
              prenom: true,
              telephone: true
            }
          }
        }
      });

      res.status(200).json({
        message: "Livreur assigné avec succès",
        order: updatedOrder
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les commandes d'un utilisateur
  async getUserOrders(req, res) {
    try {
      const { userId } = req.params;
      const { status, page = 1, limit = 20 } = req.query;
      
      const whereClause = { userId: parseInt(userId) };
      if (status) {
        whereClause.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [orders, totalCount] = await Promise.all([
        prisma.gasOrder.findMany({
          where: whereClause,
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
                location: true,
                deliveryTime: true
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
            review: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: parseInt(limit)
        }),
        prisma.gasOrder.count({
          where: whereClause
        })
      ]);

      res.status(200).json({
        orders,
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

  // Obtenir les commandes d'un vendeur
  async getVendorOrders(req, res) {
    try {
      const { vendorId } = req.params;
      const { status, page = 1, limit = 20 } = req.query;
      
      const whereClause = { vendorId: parseInt(vendorId) };
      if (status) {
        whereClause.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [orders, totalCount] = await Promise.all([
        prisma.gasOrder.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                phone: true
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
            review: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: parseInt(limit)
        }),
        prisma.gasOrder.count({
          where: whereClause
        })
      ]);

      res.status(200).json({
        orders,
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

  // Annuler une commande
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { cancellationReason } = req.body;

      // Vérifier que la commande peut être annulée
      const order = await prisma.gasOrder.findUnique({
        where: { id: parseInt(id) }
      });

      if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }

      if (['GAS_DELIVERED', 'GAS_CANCELLED'].includes(order.status)) {
        return res.status(400).json({ 
          message: "Cette commande ne peut pas être annulée" 
        });
      }

      const cancelledOrder = await prisma.gasOrder.update({
        where: { id: parseInt(id) },
        data: {
          status: 'GAS_CANCELLED',
          cancelledAt: new Date(),
          cancellationReason,
          paymentStatus: 'GAS_PAYMENT_REFUNDED'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              phone: true
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

      res.status(200).json({
        message: "Commande annulée avec succès",
        order: cancelledOrder
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les statistiques des commandes
  async getOrdersStats(req, res) {
    try {
      const { vendorId, startDate, endDate } = req.query;
      
      let whereClause = {};
      
      if (vendorId) {
        whereClause.vendorId = parseInt(vendorId);
      }
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      const [
        totalOrders,
        pendingOrders,
        confirmedOrders,
        preparingOrders,
        readyOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue
      ] = await Promise.all([
        prisma.gasOrder.count({ where: whereClause }),
        prisma.gasOrder.count({ where: { ...whereClause, status: 'GAS_PENDING' } }),
        prisma.gasOrder.count({ where: { ...whereClause, status: 'GAS_CONFIRMED' } }),
        prisma.gasOrder.count({ where: { ...whereClause, status: 'GAS_PREPARING' } }),
        prisma.gasOrder.count({ where: { ...whereClause, status: 'GAS_READY' } }),
        prisma.gasOrder.count({ where: { ...whereClause, status: 'GAS_OUT_FOR_DELIVERY' } }),
        prisma.gasOrder.count({ where: { ...whereClause, status: 'GAS_DELIVERED' } }),
        prisma.gasOrder.count({ where: { ...whereClause, status: 'GAS_CANCELLED' } }),
        prisma.gasOrder.aggregate({
          where: { ...whereClause, status: 'GAS_DELIVERED' },
          _sum: { totalPrice: true }
        })
      ]);

      const stats = {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          preparing: preparingOrders,
          ready: readyOrders,
          outForDelivery: outForDeliveryOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
          deliveryRate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0
        },
        revenue: {
          total: totalRevenue._sum.totalPrice || 0,
          average: deliveredOrders > 0 ? ((totalRevenue._sum.totalPrice || 0) / deliveredOrders).toFixed(0) : 0
        }
      };

      res.status(200).json(stats);
    } catch (error) {
      handleServerError(res, error);
    }
  }
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}