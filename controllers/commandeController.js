import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { commande: Commande, plats: Plats } = prisma;

export default {
  async getAllCommande(req, res) {
    try {
      const data = await Commande.findMany({
        
      });
      console.log(data)
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
      const data = await Commande.findUnique({
        where: { id },
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
  async addCommande(req, res) {
    try {
        console.log(req.file);
        const commandes = req.body.commande; // Accéder à la clé "commande"
        if (!commandes || !Array.isArray(commandes)) {
            return res.status(400).json({ message: "Invalid command data" });
        }
        const results = await Promise.all(commandes.map(async commandeData => {
            const commande = {
                quantity: commandeData.quantity,
                userId: commandeData.userId,
                platsId: commandeData.platsId
            };
            console.log("la commande: " + commande)
            const result = await Commande.create({ data: commande });
            console.log("commande créée :", result);
            return result;
        }));
        console.log("commandes créées :", results);
        res.status(200).json({
            message: 'Commande créée avec succès',
            results,
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
        quantity: req.body.quantity,
      };
      const result = await Commande.update({ data: commande, where: { id } });
      console.log("Résultats de la création des commandes :", result);
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
