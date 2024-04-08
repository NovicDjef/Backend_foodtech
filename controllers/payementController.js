import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { payement: Payement } = prisma;

export default {
  async getAllPayement(req, res) {
    try {
      const data = await Payement.findMany({
        include: {
          User: true,
          Commande: true,
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

  async getPayementById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = await Payement.findUnique({ 
        where: { id },
        include: {
          User: true,
          Commande: true,
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

  async addPayement(req, res) {
    try {
      const payement = {
        montant: req.body.montant,
        mode_payement: req.body.mode_payement,
        include: {
          User: true,
          Commande: true,
        }
      };
      const result = await Payement.create({ data: payement });
      res.status(200).json({
        message: 'Intervention Materiel create success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async deletePayement(req, res) {
    try {
      const id = parseInt(req.params.id);
      const result = await Payement.delete({ 
        where: { id },
        include: {
          User: true,
          Commande: true,
        } });
      res.status(201).json({
        message: 'Payement Materiel delete success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async updatePayement(req, res) {
    try {
      const id = parseInt(req.params.id);
      const payement = {
        montant: req.body.montant,
        mode_payement: req.body.mode_payement,
        include: {
          User: true,
          Commande: true,
        }
      };
      const result = await Payement.updateMany({
        data: payement,
        where: { id },
      });
      res.status(201).json({
        message: 'Note Materiel update success',
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
