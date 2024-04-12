import pkg from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const { PrismaClient } = pkg
const prisma = new PrismaClient()

const { ville: Ville } = prisma

export default {
  async getAllVille(req, res) {
    try {
      const data = await Ville.findMany();
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async getVilleById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = await Ville.findUnique({ where: { id } });
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async addVille(req, res) {
    try {
      const ville = {
        nom: req.body.nom,
      };
      const result = await Ville.create({ data: ville });
      res.status(200).json({
        message: 'Ville create success',
        result,
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async deleteVille(req, res) {
    try {
      const id = parseInt(req.params.id);
      const result = await Ville.delete({ where: { id } });
      res.status(201).json({
        message: 'Ville delete success',
        result,
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async updateVille(req, res) {
    try {
      const id = parseInt(req.params.id);
      const ville = {
        nom: req.body.nom,
      };
      const updatedVille = await Ville.update({ where: { id }, data: ville });
      res.status(201).json({
        message: 'Ville updated successfully',
        updatedVille,
      });
    } catch (error) {
      handleServerError(res, error);
    }
  }
};

async function handleServerError(res, error) {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong', error });
}
