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
//   async addCommande(req, res) {
//     try {
//         const commandes = req.body.commande; // Accéder à la clé "commande"
//         if (!commandes || !Array.isArray(commandes)) {
//             return res.status(400).json({ message: "Invalid command data" });
//         }
//         const results = await Promise.all(commandes.map(async commandeData => {
//             const commande = {
//                 quantity: commandeData.quantity,
//                 prix: commandeData.prix,
//                 recommandation: commandeData.recommandation,
//                 userId: commandeData.userId,
//                 platsId: commandeData.platsId
//             };
//             const result = await Commande.create({ data: commande });
//             console.log("resultat :", commande)
//             return result;
            
//         }));
        
//         console.log("resultat :", results)
//         res.status(200).json({
//             message: 'Felicitation votre Commande a été créée avec succès vous recevrez un Appel dans les minutes qui suivre.',
//             results,
//         });
//     } catch (error) {
//         await handleServerError(res, error);
//     }
// },

async addCommande(req, res) {
  try {
    const commandes = req.body.commande;
    if (!commandes || !Array.isArray(commandes)) {
      return res.status(400).json({ message: "Invalid command data" });
    }

    const userExists = await prisma.User.findUnique({
      where: { id: commandes[0].userId }
    });

    if (!userExists) {
      return res.status(400).json({ message: "Cet utilisateur n'existe pas" });
    }
    const results = await Promise.all(commandes.map(async commandeData => {
      const commande = {
        quantity: commandeData.quantity,
        prix: commandeData.prix,
        recommandation: commandeData.recommandation,
        userId: commandeData.userId,
        platsId: commandeData.platsId,
        position: commandeData.position
      };
      const result = await Commande.create({ data: commande });
      console.log("Commande ajoutée :", result, commande);
      return result;    
              
    }));

    res.status(200).json({
      message: 'Félicitation, votre commande a été créée avec succès. Vous recevrez un appel dans les minutes qui suivent.',
      results,
    });
  } catch (error) {
    console.error("Erreur lors de la commande :", error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors du traitement de votre commande.' });
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
        quantity: commandeData.quantity,
        prix: commandeData.prix,
        recommandation: commandeData.recommandation,
        userId: commandeData.userId,
        platsId: commandeData.platsId,
        position: commandeData.position
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
