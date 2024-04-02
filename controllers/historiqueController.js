import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { historique: Historique } = prisma;
const { admin: Admin } = prisma;

export default {
  async getAllHistorique(req, res) {
    try {
      const data = await Historique.findMany();
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async getHistoriqueById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = await Historique.findUnique({ where: { id: id } });
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async addHistorique(req, res) {
    try {
      const historique = {
        statut_historique: req.body.statut_historique,
        commandeId: req.body.commandeId,
      };
      console.log(historique);
      const result = await Historique.create({ data: historique });
      res.status(200).json({
        message: 'Historique create success',
        result,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async deleteHistorique(req, res) {
    try {
      const id = parseInt(req.params.id);
      const result = await Historique.delete({ where: { id: id } });
      res.status(201).json({
        message: 'Historique delete success',
        result,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async updateHistorique(req, res) {
    try {
      const id = parseInt(req.params.id);
      const historique = {
        statut_historique: req.body.statut_historique,
        commandeId: req.body.commandeId,
      };
      console.log(historique);
      const result = await Historique.update({
        where: { id: id },
        data: historique,
      });
      res.status(201).json({
        message: 'Historique update success',
        result,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },
};
function handleServerError(res, error) {
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong', error: error });
}