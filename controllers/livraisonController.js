import pkg from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


const { PrismaClient } = pkg
const prisma = new PrismaClient()

const { livraison: Livraison } = prisma


export default {
    // CRUD des Livraison
    async getAllLivraison(req, res) {
      try {
        const data = await Livraison.findMany();
        if (data.length > 0) {
          res.status(200).json(data);
        } else {
          res.status(404).json({ message: 'not found data' });
        }
      } catch (error) {
        res.status(500).json({
          message: 'Somthing went Wrong',
          error: error,
        });
      }
    },

    async getLivraisonById(req, res) {
      try {
        const id = parseInt(req.params.id);
        const data = await Livraison.findUnique({ where: { id: id } });
        if (data) {
          res.status(200).json(data);
        } else {
          res.status(404).json({ message: 'not found data' });
        }
      } catch (error) {
        res.status(500).json({
          message: 'Somthing went Wrong',
          error: error,
        });
      }
    },

async addLivraison(req, res) {
  try{
    const livraison = {
      statut: req.body.statut,
      adresse: req.body.adresse,
      serviceLivraisonId : req.body.serviceLivraisonId,
      // include: {
      //   commande: true
      // }
      }
      console.log(livraison)
      const result = await Livraison.create({ data: livraison });
      console.log("resultat  :", result)
      res.status(200).json({
        message: 'Livraison create success',
        livraison: result,
      });
  } catch (error) {
    res.status(500).json({
      message: 'Somthing went Wrong',
      error: error,
    });
  }
  },
  async deleteLivraison(req, res) {
    try {
      const id = parseInt(req.params.id);
      const result = await Livraison.delete({ where: { id: id } });
      res.status(201).json({
        message: 'Livraison delete success',
        result,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Somthing went Wrong',
        error: error,
      });
    }
  },
  async updateLivraison(req, res) {
    try {
      const id = parseInt(req.params.id);
      const livraison = {
        //statut: req.body.statut,
      adresse: req.body.adresse,
      //serviceLivraisonId : req.body.serviceLivraisonId,
      // include: {
      //   commande: true
      // }
      };
      console.log(livraison)
      const result = await Livraison.updateMany({ data: livraison, where: { id: id } });
      console.log(result)
      res.status(201).json({
        message: 'Livraison update success',
        result,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Somthing went Wrong',
        error: error,
      });
    }
  }

}

  