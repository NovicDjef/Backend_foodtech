import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { restaurant: Restaurant } = prisma;

export default {
  async getAllRestaurant(req, res) {
    try {
      const data = await Restaurant.findMany();
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async getRestaurantById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = await Restaurant.findUnique({ where: { id } });
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async addRestaurant(req, res) {
    try {
      const restaurant = {
        nom_restaurant: req.body.nom_restaurant,
        ville: req.body.ville,
        Adresse_restaurant: req.body.Adresse_restaurant,
        // image_restaurant: req.file.filename,
        image_restaurant: req.body.image_restaurant,
        articleId: req.body.articleId,
        reservationId: req.body.reservationId,
      };
      const result = await Restaurant.create({ data: restaurant });
      res.status(200).json({
        message: 'Restaurant create success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async deleteRestaurant(req, res) {
    try {
      const id = parseInt(req.params.id);
      const result = await Restaurant.delete({ where: { id } });
      res.status(201).json({
        message: 'Restaurant delete success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async updateRestaurant(req, res) {
    try {
      const id = parseInt(req.params.id);
      const restaurant = {
        nom_restaurant: req.body.nom_restaurant,
        ville: req.body.ville,
        Adresse_restaurant: req.body.Adresse_restaurant,
        // image_restaurant: req.file.filename,
        image_restaurant: req.body.image_restaurant,
        articleId: req.body.articleId,
        reservationId: req.body.reservationId,
      };
      const result = await Restaurant.update({ data: restaurant, where: { id } });
      res.status(201).json({
        message: 'equpement update success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },
};
function handleServerError(res, error) {
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong', error: error });
}
