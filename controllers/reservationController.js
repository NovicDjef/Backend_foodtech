import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  // Créer une nouvelle réservation
  async createReservation(req, res) {
    try {
      const { numero_table, nombre_personne, prix_reservation, userId, restaurantId } = req.body;
      
      const newReservation = await prisma.reservation.create({
        data: {
          numero_table,
          nombre_personne: parseInt(nombre_personne),
          prix_reservation: parseFloat(prix_reservation),
          user: userId ? { connect: { id: parseInt(userId) } } : undefined,
          restaurant: restaurantId ? { connect: { id: parseInt(restaurantId) } } : undefined,
        },
        include: {
          user: true,
          restaurant: true,
        },
      });

      res.status(201).json({
        message: "Réservation créée avec succès",
        reservation: newReservation
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir toutes les réservations
  async getAllReservations(req, res) {
    try {
      const reservations = await prisma.reservation.findMany({
        include: {
          user: true,
          restaurant: true,
        }
      });

      res.status(200).json(reservations);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir une réservation par son ID
  async getReservationById(req, res) {
    try {
      const { id } = req.params;
      const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
          restaurant: true,
        }
      });

      if (!reservation) {
        return res.status(404).json({ message: "Réservation non trouvée" });
      }

      res.status(200).json(reservation);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour une réservation
  async updateReservation(req, res) {
    try {
      const { id } = req.params;
      const { numero_table, nombre_personne, prix_reservation } = req.body;

      const updatedReservation = await prisma.reservation.update({
        where: { id: parseInt(id) },
        data: {
          numero_table,
          nombre_personne: nombre_personne ? parseInt(nombre_personne) : undefined,
          prix_reservation: prix_reservation ? parseFloat(prix_reservation) : undefined,
        },
        include: {
          user: true,
          restaurant: true,
        },
      });

      res.status(200).json({
        message: "Réservation mise à jour avec succès",
        reservation: updatedReservation
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer une réservation
  async deleteReservation(req, res) {
    try {
      const { id } = req.params;

      await prisma.reservation.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Réservation supprimée avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les réservations d'un utilisateur spécifique
  async getUserReservations(req, res) {
    try {
      const { userId } = req.params;
      const reservations = await prisma.reservation.findMany({
        where: { userId: parseInt(userId) },
        include: {
          restaurant: true,
        }
      });

      res.status(200).json(reservations);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les réservations pour un restaurant spécifique
  async getRestaurantReservations(req, res) {
    try {
      const { restaurantId } = req.params;
      const reservations = await prisma.reservation.findMany({
        where: { restaurantId: parseInt(restaurantId) },
        include: {
          user: true,
        }
      });

      res.status(200).json(reservations);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Vérifier la disponibilité d'une table
  async checkTableAvailability(req, res) {
    try {
      const { restaurantId, numero_table, date } = req.query;
      
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          restaurantId: parseInt(restaurantId),
          numero_table: numero_table,
          createdAt: {
            gte: new Date(date),
            lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
          }
        }
      });

      const isAvailable = !existingReservation;

      res.status(200).json({
        isAvailable,
        message: isAvailable ? "La table est disponible" : "La table est déjà réservée"
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}
