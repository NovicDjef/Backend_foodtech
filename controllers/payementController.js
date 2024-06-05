import pkg from '@prisma/client';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import FormData from 'form-data';

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
      const { amount, mode_payement, currency, userId, commandeId, phone, email } = req.body;

      console.log('Request Body:', req.body);

      if (!amount || isNaN(amount)) {
        return res.status(400).json({ message: 'Invalid amount' });
      }

      if (!mode_payement) {
        return res.status(400).json({ message: 'Mode de paiement manquant' });
      }

      function generateUniqueReference() {
        return 'ref_' + new Date().getTime();
      }
      const uniqueReference = generateUniqueReference();
      console.log(uniqueReference);

    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('mode_payement', mode_payement);
    formData.append('currency', currency);
    formData.append('userId', userId);
    formData.append('commandeId', commandeId);
    formData.append('phone', phone);
    
      // Initiate payement with Notch Pay API
      const payementResponse = await axios.post('https://api.notchpay.co/payments/initialize', formData, {
        headers: {
          'Authorization': 'pk_test.mhjhxBw29HQIMFbLdjb206R5CcUb8wpXMgZUL2fSQqcDAfNvzkUwNpQ34q53K66QvWUVBdii3HTJILAZhwdVQNl9YUanhpps7RNYb0KpJWBDGf3yBHrUSHNbC1Bpa',
          'Accept': 'application/json',
          ...formData.getHeaders()
        }
      });
      if (payementResponse.status !== 201) {
        throw new Error('Failed to initialize payment');
      }

      const { transaction, authorization_url } = payementResponse.data;

      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      const commandeExists = await prisma.commande.findUnique({ where: { id: commandeId } });
  
      if (!userExists) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (!commandeExists) {
        return res.status(404).json({ message: 'Commande not found' });
      } 

      const paymentData = {
        amount: parseInt(amount),
        mode_payement,
        currency,
        userId: parseInt(userId),
        commandeId: parseInt(commandeId),
        phone,
        status: 'pending',
        reference: uniqueReference,
        authorization_url,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await Payement.create({ data: paymentData });
    console.log("Result:", result);

      console.debug("payementResponse :", authorization_url)
      res.status(201).json({
        status: "Accepted",
        message: "Payement initialized",
        transaction,
        authorization_url,
      });
    } catch (error) {
      console.error('Error initiating payement:', error);
      res.status(error.response?.status || 500).json({
        message: 'Something went wrong',
        error: error.response?.data || error.message
      });
    }
  },
    // async addPayement(req, res) {
    //   try {
    //     const { amount, mode_payement, currency, userId, commandeId, phone, email, description } = req.body;
  
    //     console.log('Request Body:', req.body);
  
    //     if (!amount || isNaN(amount)) {
    //       return res.status(400).json({ message: 'Invalid amount' });
    //     }
  
    //     if (!mode_payement) {
    //       return res.status(400).json({ message: 'Mode de paiement manquant' });
    //     }
  
    //     function generateUniqueReference() {
    //       return 'ref_' + new Date().getTime();
    //     }
    //     const uniqueReference = generateUniqueReference();
    //     console.log(uniqueReference);
  
    //     const formData = new FormData();
    //     formData.append('amount', amount);
    //     formData.append('mode_payement', mode_payement);
    //     formData.append('currency', currency);
    //     formData.append('userId', userId);
    //     formData.append('commandeId', commandeId);
    //     formData.append('phone', phone);
    //     formData.append('email', email);
    //     formData.append('description', description);
  
    //     // Initiate payement with Notch Pay API
    //     const payementResponse = await axios.post('https://api.notchpay.co/payements/initialize', formData, {
    //       headers: {
    //         'Authorization': 'pk_test.Dn2dsCpu8kkdJ6KSR01jyx54ycWKeNp0rMjjLrYFUh6qZKloKVzqcakJFHuEaGtzwMWbnwZbxaimaCnPGQVs2FELVFVlVlklBGjWvLV7eKpaejX8iP3gm2Q58KvCf',
    //         'Accept': 'application/json',
    //         ...formData.getHeaders()
    //       }
    //     });
  
    //     const { transaction, authorization_url } = payementResponse.data;
  
    //     const payement = {
    //       amount: parseInt(amount),
    //       mode_payement: mode_payement,
    //       currency: currency,
    //       userId: parseInt(userId),
    //       commandeId: parseInt(commandeId),
    //       phone: phone,
    //       email: email,
    //       status: 'pending',
    //       description: description,
    //       reference: uniqueReference
    //     };
  
    //     const result = await Payement.create(payement);
  
    //     console.log("Authorization URL:", authorization_url);
  
    //     res.status(201).json({
    //       status: "Accepted",
    //       message: "Payement initialized",
    //       code: 201,
    //       transaction,
    //       authorization_url
    //     });
    //   } catch (error) {
    //     console.error('Error initiating payement:', error.response?.data || error.message);
    //     res.status(error.response?.status || 500).json({
    //       message: 'Something went wrong',
    //       error: error.response?.data || error.message
    //     });
    //   }
    // },


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
        message: 'Payement deleted successfully',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async updatePayement(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { montant, mode_payement } = req.body;

      if (!montant || isNaN(montant)) {
        return res.status(400).json({ message: 'Invalid montant' });
      }

      if (!mode_payement) {
        return res.status(400).json({ message: 'Mode de paiement manquant' });
      }

      const payement = {
        montant,
        mode_payement,
        status: 'pending'
      };

      const result = await Payement.update({
        data: payement,
        where: { id },
      });
      res.status(201).json({
        message: 'Payement updated successfully',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },
async handleWebhook(req, res) {
    try {
        const { event, data } = req.body;

        console.log('Webhook Event:', event);
        console.log('Webhook Data:', data);

        if (!event || !data) {
            console.log('Invalid webhook data:', req.body);
            return res.status(400).json({ message: 'Invalid webhook data' });
        }

        const payment = await Payement.findUnique({ where: { transaction_id: data.id } });

        console.log('Found Payment:', payment);

        if (!payment) {
            console.log('Payment not found');
            return res.status(404).json({ message: 'Payment not found' });
        }

        let statusToUpdate;
        if (event === 'payment.success') {
            statusToUpdate = 'complete';
        } else if (event === 'payment.failed') {
            statusToUpdate = 'failed';
        } else if (event === 'payment.expired') {
            statusToUpdate = 'expired';
        } else {
            console.log('Unknown event:', event);
            return res.status(400).json({ message: 'Unknown event' });
        }

        console.log('Updating payment status to:', statusToUpdate);

        const updatedPayment = await Payement.update({
            where: { transaction_id: data.id },
            data: { status: statusToUpdate }
        });

        console.log('Updated Payment:', updatedPayment);

        res.status(200).json({ message: 'Payment status updated' });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

}

async function handleServerError(res, error) {
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong', error: error.message });
}

