import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { categorie: Categorie } = prisma;

export default {
  async getAllCategorie(req, res) {
    try {
      const data = await Categorie.findMany({
        include: {
          plats: true
        }
      });
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
      const data = await Categorie.findUnique({ 
        where: { id },
        include: {
          plats: true
        } });
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
        name: req.body.name,
        image: req.file.filename,    //a mettre en place pour l'ajout dynamique des images
        description: req.body.description,
        menuId: parseInt(req.body.menuId), 
        // restaurantId: req.body.restaurantId,
        // include: {
        //   plats: true
        // }
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
      const result = await Categorie.delete({ 
        where: { id },
        include: {
          plats: true
        } });
      res.status(201).json({
        message: 'categorie delete success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async updateCategorie(req, res) {
    const id = parseInt(req.params.id);
    try {
      const categorie = {
        name: req.body.name,
        image: req.file.filename, 
        description: req.body.description, 
        menuId: parseInt(req.body.menuId),  
        // include: {
        //   plats: true,
        // }
      };
      const result = await Categorie.updateMany({
        where: { id },
        data: categorie,
      });
      res.status(201).json({
        message: 'categorie update success',
        result: result,
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
