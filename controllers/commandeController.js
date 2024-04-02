import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { commande: Commande } = prisma;

export default {
  async getAllCommande(req, res) {
    try {
      const data = await Commande.findMany();
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async getCommandeById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = await Commande.findUnique({ where: { id } });
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async addCommande(req, res) {
    try {
      console.log(req.file);
      const commande = {
        statut_commende: req.body.statut_commende,
        userId: req.body.userId,
        platsId: req.body.platsId,
        articleId: req.body.articleId,
      };
      console.log(commande);
      const result = await Commande.create({ data: commande });
      res.status(200).json({
        message: 'Commande create success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async deleteCommande(req, res) {
    try {
      const id = parseInt(req.params.id);
      const result = await Commande.delete({ where: { id } });
      res.status(201).json({
        message: 'commande delete success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async updateCommande(req, res) {
    try {
      const id = parseInt(req.params.id);
      const commande = {
        statut_commende: req.body.statut_commende,
        userId: req.body.userId,
        platsId: req.body.platsId,
        articleId: req.body.articleId,
      };
      const result = await Commande.update({ data: commande, where: { id } });
      res.status(201).json({
        message: 'Commande update success',
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
