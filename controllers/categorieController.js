import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { categorie: Categorie } = prisma;

export default {
  async getAllCategorie(req, res) {
    try {
      const data = await Categorie.findMany();
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async getCategorieById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = await Categorie.findUnique({ where: { id } });
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async addCategorie(req, res) {
    try {
      const categorie = {
        name_categorie: req.body.name_categorie,
        // image_categorie: req.file.filename,    //a mettre en place pour l'ajout dynamique des images
        image_categorie: req.body.image_categorie, 
        description: req.body.description,
        restaurantId: req.body.restaurantId,
        menuId: req.body.menuId,
        platsId: req.body.platsId,
      };
      const result = await Categorie.create({ data: categorie });
      res.status(200).json({
        message: 'Categorie create success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async deleteCategorie(req, res) {
    try {
      const id = parseInt(req.params.id);
      const result = await Categorie.delete({ where: { id } });
      res.status(201).json({
        message: 'categorie delete success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async updateCategorie(req, res) {
    try {
      const id = parseInt(req.params.id);
      const categorie = {
        name_categorie: req.body.name_categorie,
       // image_categorie: req.file.filename,    //a mettre en place pour l'ajout dynamique des images
       image_categorie: req.body.image_categorie, 
        description: req.body.description,
        restaurantId: req.body.restaurantId,
        menuId: req.body.menuId,
        platsId: req.body.platsId,
      };
      const result = await Categorie.update({
        where: { id },
        data: categorie,
      });
      res.status(201).json({
        message: 'categorie update success',
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
