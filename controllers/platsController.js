import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { plats: Plats } = prisma;

export default {
  async getAllPlats(req, res) {
    try {
      const data = await Plats.findMany();
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async getPlatsById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = await Plats.findUnique({ where: { id } });
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async addPlats(req, res) {
    try {
      const plats = {
        nom_plat: req.body.nom_plat,
        // image_plat: req.file.filename,
        description_plat: req.body.description_plat,
        prix_plat: req.body.prix_plat,
        image_plat: req.body.image_plat,
        menssionPLat: req.body.menssionPLat,
        restaurantId: req.body.restaurantId,
        articleId: req.body.articleId,
      };
      console.log(plats)
      const result = await Plats.create({ data: plats });
      res.status(200).json({
        message: 'plat create success',
        plats: result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async updatePlats(req, res) {
    try {
      const id = parseInt(req.params.id);
      const plats = {
        nom_plat: req.body.nom_plat,
        // image_plat: req.file.filename,
        description_plat: req.body.description_plat,
        prix_plat: req.body.prix_plat,
        image_plat: req.body.image_plat,
        menssionPLat: req.body.menssionPLat,
        restaurantId: req.body.restaurantId,
        articleId: req.body.articleId,
      };
      const result = await Plats.update({
        where: { id },
        data: plats,
      });
      res.status(201).json({
        message: 'Software update success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async deletePlats(req, res) {
    try {
      const id = parseInt(req.params.id);
      const result = await Plats.delete({ where: { id } });
      res.status(201).json({
        message: 'Software delete success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },
};

async function handleServerError(res, error) {
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong', error: error });
}
