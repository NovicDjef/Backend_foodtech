import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { restaurant: Restaurant, plats: Plats } = prisma;

export default {
  async getAllRestaurant(req, res) {
    try {
      const data = await Restaurant.findMany({
        include: {
          plats: true,
          article: true,
          reservation: true,
        }
      });
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
      const data = await Restaurant.findUnique({ 
        where: { id }, 
        include: {
          plats: true,
          article: true,
          reservation: true,
        }
      });
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
        nom: req.body.nom,
        phone: req.body.phone,
        description: req.body.description,
        adresse: req.body.adresse,
        image: req.file.filename,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude)
        // include: {
        //   plats: true,
        //   article: true,
        //   reservation: true,
        // }
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
      const result = await Restaurant.delete({
         where: { id },
         include: {
          plats: true,
          article: true,
          reservation: true,
        }
        });
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
        nom: req.body.nom,
        phone: req.body.phone,
        description: req.body.description,
        adresse: req.body.adresse,
        image: req.file.filename,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude)
        // include: {
        //   plats: true,
        //   article: true,
        //   reservation: true,
        // }
      };
      console.log("restaurant :", restaurant)
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
