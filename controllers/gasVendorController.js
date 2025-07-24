import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  // Créer un nouveau vendeur de gaz
  async createGasVendor(req, res) {
    try {
      const { 
        name, 
        location, 
        address, 
        latitude, 
        longitude, 
        deliveryPrice, 
        deliveryTime,
        availableBrands,
        description,
        image,
        adminId,
        villeId
      } = req.body;
      
      const newVendor = await prisma.gasVendor.create({
        data: {
          name,
          location,
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          deliveryPrice: parseFloat(deliveryPrice),
          deliveryTime,
          availableBrands: availableBrands || [],
          description,
          image,
          adminId: adminId ? parseInt(adminId) : null,
          villeId: villeId ? parseInt(villeId) : null,
        },
        include: {
          admin: true,
          ville: true,
          _count: {
            select: {
              gasOrders: true,
              reviews: true
            }
          }
        }
      });

      res.status(201).json({
        message: "Vendeur de gaz créé avec succès",
        vendor: newVendor
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir tous les vendeurs de gaz
  async getAllGasVendors(req, res) {
    try {
      const { isActive } = req.query;
      
      const whereClause = {};
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const vendors = await prisma.gasVendor.findMany({
        where: whereClause,
        include: {
          admin: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          ville: true,
          _count: {
            select: {
              gasOrders: true,
              reviews: true
            }
          }
        },
        orderBy: {
          rating: 'desc'
        }
      });

      res.status(200).json(vendors);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir un vendeur par son ID
  async getGasVendorById(req, res) {
    try {
      const { id } = req.params;
      const vendor = await prisma.gasVendor.findUnique({
        where: { id: parseInt(id) },
        include: {
          admin: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          ville: true,
          gasOrders: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  phone: true
                }
              }
            }
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              gasOrders: true,
              reviews: true
            }
          }
        }
      });

      if (!vendor) {
        return res.status(404).json({ message: "Vendeur de gaz non trouvé" });
      }

      res.status(200).json(vendor);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour un vendeur
  async updateGasVendor(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, 
        location, 
        address, 
        latitude, 
        longitude, 
        deliveryPrice, 
        deliveryTime,
        availableBrands,
        description,
        image,
        isActive,
        adminId,
        villeId
      } = req.body;

      const updatedVendor = await prisma.gasVendor.update({
        where: { id: parseInt(id) },
        data: {
          name,
          location,
          address,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          deliveryPrice: deliveryPrice ? parseFloat(deliveryPrice) : undefined,
          deliveryTime,
          availableBrands,
          description,
          image,
          isActive,
          adminId: adminId ? parseInt(adminId) : undefined,
          villeId: villeId ? parseInt(villeId) : undefined,
        },
        include: {
          admin: true,
          ville: true,
          _count: {
            select: {
              gasOrders: true,
              reviews: true
            }
          }
        }
      });

      res.status(200).json({
        message: "Vendeur de gaz mis à jour avec succès",
        vendor: updatedVendor
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer un vendeur
  async deleteGasVendor(req, res) {
    try {
      const { id } = req.params;

      // Vérifier si le vendeur a des commandes
      const vendorWithOrders = await prisma.gasVendor.findUnique({
        where: { id: parseInt(id) },
        include: { 
          gasOrders: true,
          reviews: true 
        }
      });

      if (vendorWithOrders && vendorWithOrders.gasOrders.length > 0) {
        return res.status(400).json({ 
          message: "Impossible de supprimer le vendeur car il a des commandes associées" 
        });
      }

      // Supprimer d'abord les avis s'il y en a
      if (vendorWithOrders && vendorWithOrders.reviews.length > 0) {
        await prisma.gasVendorReview.deleteMany({
          where: { vendorId: parseInt(id) }
        });
      }

      await prisma.gasVendor.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Vendeur de gaz supprimé avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Rechercher des vendeurs par localisation
  async searchVendorsByLocation(req, res) {
    try {
      const { query, latitude, longitude, radius = 10 } = req.query;
      
      let whereClause = {
        isActive: true
      };

      if (query) {
        whereClause.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } }
        ];
      }

      const vendors = await prisma.gasVendor.findMany({
        where: whereClause,
        include: {
          ville: true,
          _count: {
            select: {
              gasOrders: true,
              reviews: true
            }
          }
        },
        orderBy: {
          rating: 'desc'
        }
      });

      // Si coordonnées fournies, filtrer par distance
      let filteredVendors = vendors;
      if (latitude && longitude) {
        const userLat = parseFloat(latitude);
        const userLon = parseFloat(longitude);
        const maxRadius = parseFloat(radius);

        filteredVendors = vendors.filter(vendor => {
          const distance = calculateDistance(userLat, userLon, vendor.latitude, vendor.longitude);
          return distance <= maxRadius;
        }).map(vendor => ({
          ...vendor,
          distance: calculateDistance(userLat, userLon, vendor.latitude, vendor.longitude)
        })).sort((a, b) => a.distance - b.distance);
      }

      res.status(200).json(filteredVendors);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les vendeurs d'une ville spécifique
  async getVendorsByVille(req, res) {
    try {
      const { villeId } = req.params;
      
      const vendors = await prisma.gasVendor.findMany({
        where: { 
          villeId: parseInt(villeId),
          isActive: true
        },
        include: {
          ville: true,
          _count: {
            select: {
              gasOrders: true,
              reviews: true
            }
          }
        },
        orderBy: {
          rating: 'desc'
        }
      });

      res.status(200).json(vendors);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les vendeurs proches d'une position
  async getNearbyVendors(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.body;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ 
          message: "Latitude et longitude sont requis" 
        });
      }

      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);
      const maxRadius = parseFloat(radius);

      // Récupérer tous les vendeurs actifs
      const vendors = await prisma.gasVendor.findMany({
        where: { isActive: true },
        include: {
          ville: true,
          _count: {
            select: {
              gasOrders: true,
              reviews: true
            }
          }
        }
      });

      // Filtrer par distance et ajouter la distance calculée
      const nearbyVendors = vendors.filter(vendor => {
        const distance = calculateDistance(userLat, userLon, vendor.latitude, vendor.longitude);
        return distance <= maxRadius;
      }).map(vendor => ({
        ...vendor,
        distance: parseFloat(calculateDistance(userLat, userLon, vendor.latitude, vendor.longitude).toFixed(2))
      })).sort((a, b) => a.distance - b.distance);

      res.status(200).json({
        vendors: nearbyVendors,
        totalFound: nearbyVendors.length,
        searchRadius: maxRadius,
        userLocation: { latitude: userLat, longitude: userLon }
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Activer/Désactiver un vendeur
  async toggleVendorStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const updatedVendor = await prisma.gasVendor.update({
        where: { id: parseInt(id) },
        data: { isActive },
        include: {
          _count: {
            select: {
              gasOrders: true,
              reviews: true
            }
          }
        }
      });

      res.status(200).json({
        message: `Vendeur ${isActive ? 'activé' : 'désactivé'} avec succès`,
        vendor: updatedVendor
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les statistiques d'un vendeur
  async getVendorStats(req, res) {
    try {
      const { id } = req.params;

      const vendor = await prisma.gasVendor.findUnique({
        where: { id: parseInt(id) },
        include: {
          gasOrders: {
            include: {
              review: true
            }
          },
          reviews: true
        }
      });

      if (!vendor) {
        return res.status(404).json({ message: "Vendeur non trouvé" });
      }

      // Calculer les statistiques
      const totalOrders = vendor.gasOrders.length;
      const completedOrders = vendor.gasOrders.filter(order => order.status === 'GAS_DELIVERED').length;
      const cancelledOrders = vendor.gasOrders.filter(order => order.status === 'GAS_CANCELLED').length;
      const pendingOrders = vendor.gasOrders.filter(order => 
        ['GAS_PENDING', 'GAS_CONFIRMED', 'GAS_PREPARING', 'GAS_READY', 'GAS_OUT_FOR_DELIVERY'].includes(order.status)
      ).length;

      const totalRevenue = vendor.gasOrders
        .filter(order => order.status === 'GAS_DELIVERED')
        .reduce((sum, order) => sum + order.totalPrice, 0);

      const avgRating = vendor.reviews.length > 0 
        ? vendor.reviews.reduce((sum, review) => sum + review.rating, 0) / vendor.reviews.length 
        : vendor.rating;

      const stats = {
        vendor: {
          id: vendor.id,
          name: vendor.name,
          location: vendor.location
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
          pending: pendingOrders,
          completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0
        },
        revenue: {
          total: totalRevenue,
          average: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0
        },
        rating: {
          average: parseFloat(avgRating.toFixed(1)),
          totalReviews: vendor.reviews.length
        }
      };

      res.status(200).json(stats);
    } catch (error) {
      handleServerError(res, error);
    }
  }
};

// Fonction utilitaire pour calculer la distance entre deux points GPS
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}