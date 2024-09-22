// import pkg from '@prisma/client';
// import axios from 'axios';
// import { PrismaClient } from '@prisma/client';
// import FormData from 'form-data';

// const prisma = new PrismaClient();
// const { payement: Payement } = prisma;

// export default {
//   async getAllPayement(req, res) {
//     try {
//       const data = await Payement.findMany({
//         include: {
//           User: true,
//           Commande: true,
//         }
//       });
//       if (data.length > 0) {
//         res.status(200).json(data);
//       } else {
//         res.status(404).json({ message: 'not found data' });
//       }
//     } catch (error) {
//       await handleServerError(res, error);
//     }
//   },

//   async getPayementById(req, res) {
//     try {
//       const id = parseInt(req.params.id);
//       const data = await Payement.findUnique({ 
//         where: { id },
//         include: {
//           User: true,
//           Commande: true,
//         } });
//       if (data) {
//         res.status(200).json(data);
//       } else {
//         res.status(404).json({ message: 'not found data' });
//       }
//     } catch (error) {
//       await handleServerError(res, error);
//     }
//   },

//   async addPayement(req, res) {
//     try {
//       const { amount, mode_payement, currency, userId, commandeId, phone, email, description } = req.body;
//       console.log('Request Body:', req.body);
  
//       if (!amount || isNaN(amount)) {
//         return res.status(400).json({ message: 'Invalid amount' });
//       }
  
//       if (!mode_payement) {
//         return res.status(400).json({ message: 'Mode de paiement manquant' });
//       }
  
//       // Valider userId et commandeId
//       if (!userId || isNaN(userId)) {
//         return res.status(400).json({ message: 'Invalid userId format' });
//       }
  
//       if (!commandeId || isNaN(commandeId)) {
//         return res.status(400).json({ message: 'Invalid commandeId format' });
//       }
  
//       const userIdInt = parseInt(userId, 10);
//       const commandeIdInt = parseInt(commandeId, 10);
  
//       // Génération d'une référence unique
//       function generateUniqueReference() {
//         return 'ref' + new Date().getTime();
//       }
//       const uniqueReference = generateUniqueReference();
  
//       // Configuration des données pour la requête de paiement
//       const formData = new FormData();
//       formData.append('amount', amount);
//       formData.append('mode_payement', mode_payement);
//       formData.append('currency', currency);
//       formData.append('userId', userIdInt);
//       formData.append('commandeId', commandeIdInt);
//       formData.append('phone', phone);
//       formData.append('email', email);
//       formData.append('description', description);
  
//       // Initialisation du paiement avec l'API Notch Pay
//       const payementResponse = await axios.post('https://api.notchpay.co/payments/initialize', formData, {
//         headers: {
//           'Authorization': 'pk_test.mhjhxBw29HQIMFbLdjb206R5CcUb8wpXMgZUL2fSQqcDAfNvzkUwNpQ34q53K66QvWUVBdii3HTJILAZhwdVQNl9YUanhpps7RNYb0KpJWBDGf3yBHrUSHNbC1Bpa',
//           'Accept': 'application/json',
//           ...formData.getHeaders()
//         }
//       });
  
//       if (payementResponse.status !== 201) {
//         throw new Error('Failed to initialize payment');
//       }
  
//       const { transaction, authorization_url } = payementResponse.data;
  
//       // Vérifier si l'utilisateur et la commande existent
//       const userExists = await prisma.user.findUnique({ where: { id: userIdInt } });
//       const commandeExists = await prisma.commande.findUnique({ where: { id: commandeIdInt } });
  
//       if (!userExists) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       if (!commandeExists) {
//         return res.status(404).json({ message: 'Commande not found' });
//       }
  
//       // Enregistrement du paiement
//       const paymentData = {
//         amount: parseInt(amount),
//         mode_payement,
//         currency,
//         userId: userIdInt,
//         commandeId: commandeIdInt,
//         phone,
//         status: 'pending',
//         reference: uniqueReference,
//         authorization_url,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       };
//       const result = await Payement.create({ data: paymentData });
  
//       console.log("Result:", result);
//       res.status(201).json({
//         status: "Accepted",
//         message: "Payement initialized",
//         transaction,
//         authorization_url,
//       });
//     } catch (error) {
//       console.error('Error initiating payement:', error);
//       res.status(error.response?.status || 500).json({
//         message: 'Something went wrong',
//         error: error.response?.data || error.message
//       });
//     }
//   },
  
    

//   async deletePayement(req, res) {
//     try {
//       const id = parseInt(req.params.id);
//       const result = await Payement.delete({ 
//         where: { id },
//         include: {
//           User: true,
//           Commande: true,
//         } });
//       res.status(201).json({
//         message: 'Payement deleted successfully',
//         result,
//       });
//     } catch (error) {
//       await handleServerError(res, error);
//     }
//   },

//   async updatePayement(req, res) {
//     try {
//       const id = parseInt(req.params.id);
//       const { montant, mode_payement } = req.body;

//       if (!montant || isNaN(montant)) {
//         return res.status(400).json({ message: 'Invalid montant' });
//       }

//       if (!mode_payement) {
//         return res.status(400).json({ message: 'Mode de paiement manquant' });
//       }

//       const payement = {
//         montant,
//         mode_payement,
//         status: 'pending'
//       };

//       const result = await Payement.update({
//         data: payement,
//         where: { id },
//       });
//       res.status(201).json({
//         message: 'Payement updated successfully',
//         result,
//       });
//     } catch (error) {
//       await handleServerError(res, error);
//     }
//   },
// async handleWebhook(req, res) {
//     try {
//         const { event, data } = req.body;

//         console.log('Webhook Event:', event);
//         console.log('Webhook Data:', data);

//         if (!event || !data) {
//             console.log('Invalid webhook data:', req.body);
//             return res.status(400).json({ message: 'Invalid webhook data' });
//         }

//         const payment = await Payement.findUnique({ where: { transaction_id: data.id } });

//         console.log('Found Payment:', payment);

//         if (!payment) {
//             console.log('Payment not found');
//             return res.status(404).json({ message: 'Payment not found' });
//         }

//         let statusToUpdate;
//         if (event === 'payment.success') {
//             statusToUpdate = 'complete';
//         } else if (event === 'payment.failed') {
//             statusToUpdate = 'failed';
//         } else if (event === 'payment.expired') {
//             statusToUpdate = 'expired';
//         } else {
//             console.log('Unknown event:', event);
//             return res.status(400).json({ message: 'Unknown event' });
//         }

//         console.log('Updating payment status to:', statusToUpdate);

//         const updatedPayment = await Payement.update({
//             where: { transaction_id: data.id },
//             data: { status: statusToUpdate }
//         });

//         console.log('Updated Payment:', updatedPayment);

//         res.status(200).json({ message: 'Payment status updated' });
//     } catch (error) {
//         console.error('Error handling webhook:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// },



//}

// async function handleServerError(res, error) {
//   console.error(error);
//   return res.status(500).json({ message: 'Something went wrong', error: error.message });
// }


import {PaymentOperation, RandomGenerator, Signature} from '@hachther/mesomb';

import { PrismaClient } from '@prisma/client';

import axios from 'axios'; 

import dotenv from 'dotenv';

const prisma = new PrismaClient();

const payment = new PaymentOperation({
  applicationKey: process.env.MESOMB_APP_KEY,
  accessKey: process.env.MESOMB_ACCESS_KEY,
  secretKey: process.env.MESOMB_SECRET_KEY
});

export default {
  // Créer un nouveau paiement
  async createPayement(req, res) {
    try {
      const { amount, mode_payement, currency, status, reference, phone, email, userId, commandeId } = req.body;
      
      const newPayement = await prisma.payement.create({
        data: {
          amount: parseFloat(amount),
          mode_payement,
          currency,
          status,
          reference,
          phone,
          email,
          authorization_url: '',  // À remplir si nécessaire
          user: userId ? { connect: { id: parseInt(userId) } } : undefined,
          commande: { connect: { id: parseInt(commandeId) } },
        },
        include: {
          user: true,
          commande: true,
        },
      });

      res.status(201).json({
        message: "Paiement créé avec succès",
        payement: newPayement
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },


  async addPayement(req, res) {
    try {
      const { amount, mode_payement, currency, userId, commandeId, phone, email, description } = req.body;
      console.log('Request Body:', req.body);
  
      if (!amount || isNaN(amount)) {
        return res.status(400).json({ message: 'Invalid amount' });
      }
      if (!mode_payement) {
        return res.status(400).json({ message: 'Mode de paiement manquant' });
      }
  
      const uniqueReference = 'ref_' + Date.now() + Math.random().toString(36).substring(2, 15);
  
      // Préparation des données pour Notch Pay
      const paymentData = {
        amount: parseInt(amount), // Assurez-vous que amount est un nombre
        currency,
        reference: uniqueReference,
        email,
        phone,
        description,
        callback: 'https://votre-site.com/callback', // URL de callback
        return_url: 'https://votre-site.com/return', // URL de retour après paiement
        channels: [mode_payement] // Mode de paiement sous forme de tableau
      };
  
      console.log('Données envoyées à Notch Pay:', paymentData);
  
      // Récupération de la clé API depuis les variables d'environnement
      const apiKey = process.env.NOTCH_PAY_PUBLIC_KEY;
      if (!apiKey) {
        throw new Error('La clé API Notch Pay n\'est pas définie');
      }
  
      // Appel à l'API Notch Pay
      const payementResponse = await axios.post('https://api.notchpay.co/payments/initialize', paymentData, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
  
      console.log('Réponse de Notch Pay:', payementResponse.data);
  
      const { transaction, authorization_url } = payementResponse.data;
  
      // Enregistrement du paiement dans la base de données
      const payement = {
        amount: parseInt(amount),
        mode_payement,
        currency,
        userId: parseInt(userId),
        commandeId: parseInt(commandeId),
        phone,
        email,
        status: 'pending',
        description,
        reference: uniqueReference
      };
      const result = await Payement.create(payement);
  
      res.status(201).json({
        status: "Accepted",
        message: "Paiement initialisé",
        code: 201,
        transaction,
        authorization_url
      });
  
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du paiement:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: 'Une erreur est survenue',
        error: error.response?.data || error.message
      });
    }
  },
  // Obtenir tous les paiements
  async getAllPayements(req, res) {
    try {
      const payements = await prisma.payement.findMany({
        include: {
          user: true,
          commande: true,
        }
      });

      res.status(200).json(payements);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir un paiement par son ID
  async getPayementById(req, res) {
    try {
      const { id } = req.params;
      const payement = await prisma.payement.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
          commande: true,
        }
      });

      if (!payement) {
        return res.status(404).json({ message: "Paiement non trouvé" });
      }

      res.status(200).json(payement);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour un paiement
  async updatePayement(req, res) {
    try {
      const { id } = req.params;
      const { status, authorization_url } = req.body;

      const updatedPayement = await prisma.payement.update({
        where: { id: parseInt(id) },
        data: {
          status,
          authorization_url,
        },
        include: {
          user: true,
          commande: true,
        },
      });

      res.status(200).json({
        message: "Paiement mis à jour avec succès",
        payement: updatedPayement
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer un paiement
  async deletePayement(req, res) {
    try {
      const { id } = req.params;

      await prisma.payement.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Paiement supprimé avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les paiements d'un utilisateur spécifique
  async getUserPayements(req, res) {
    try {
      const { userId } = req.params;
      const payements = await prisma.payement.findMany({
        where: { userId: parseInt(userId) },
        include: {
          commande: true,
        }
      });

      res.status(200).json(payements);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les paiements par statut
  async getPayementsByStatus(req, res) {
    try {
      const { status } = req.params;
      const payements = await prisma.payement.findMany({
        where: { status },
        include: {
          user: true,
          commande: true,
        }
      });

      res.status(200).json(payements);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour le statut d'un paiement
  async updatePayementStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedPayement = await prisma.payement.update({
        where: { id: parseInt(id) },
        data: { status },
        include: {
          user: true,
          commande: true,
        },
      });

      // Si le paiement est complété, mettre à jour le statut de la commande
      if (status === 'COMPLETE') {
        await prisma.commande.update({
          where: { id: updatedPayement.commandeId },
          data: { status: 'PAYEE' },
        });
      }

      res.status(200).json({
        message: "Statut du paiement mis à jour avec succès",
        payement: updatedPayement
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Vérifier le statut d'un paiement
  async checkPayementStatus(req, res) {
    try {
      const { reference } = req.params;
      const payement = await prisma.payement.findFirst({
        where: { reference },
        include: {
          commande: true,
        }
      });

      if (!payement) {
        return res.status(404).json({ message: "Paiement non trouvé" });
      }

      res.status(200).json({
        status: payement.status,
        payement: payement
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

          //  ******* paiement  **********

// Effectuer un dépôt (paiement) via Mobile Money
async initiatePayment(req, res) {
  try {
    const { amount, service, receiver, commandeId, userId } = req.body;
    
    if (!['MTN', 'ORANGE'].includes(service.toUpperCase())) {
      return res.status(400).json({ message: "Service doit être 'MTN' ou 'ORANGE'" });
    } 

    const response = await payment.makeDeposit({
      amount: parseFloat(amount),
      service: service.toUpperCase(), // 'MTN' ou 'ORANGE'
      payer,
      nonce: RandomGenerator.nonce()
    });

    if (response.isTransactionSuccess()) {
      // Mettre à jour le statut de la commande et du paiement dans la base de données
      await prisma.commande.update({
        where: { id: parseInt(commandeId) },
        data: { status: 'PAYEE' }
      });

      await prisma.payement.create({
        data: {
          amount: parseFloat(amount),
          mode_payement: service.toUpperCase(),
          currency: 'XAF', // ou la devise appropriée
          status: 'COMPLETE',
          reference: response.transaction.reference,
          phone: receiver,
          commandeId: parseInt(commandeId),
          userId: parseInt(userId)
        }
      });

      res.status(200).json({
        success: true,
        message: 'Paiement effectué avec succès',
        transaction: response.transaction
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Le paiement a échoué',
        errors: response.errors
      });
    }
  } catch (error) {
    handleServerError(res, error);
  }
},


};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}

