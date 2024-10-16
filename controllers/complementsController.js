import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  async createComplement(req, res) {
    try {
      const { name, price } = req.body;
      const complement = await prisma.complement.create({
        data: { name, price }
      });
      res.status(201).json(complement);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateComplement(req, res) {
    try {
      const { id } = req.params;
      const { name, price } = req.body;
      const complement = await prisma.complement.update({
        where: { id: parseInt(id) },
        data: { name, price }
      });
      res.status(200).json(complement);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteComplement(req, res) {
    try {
      const { id } = req.params;
      await prisma.complement.delete({
        where: { id: parseInt(id) }
      });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAllComplements(req, res) {
    try {
      const complements = await prisma.complement.findMany();
      res.status(200).json(complements);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getComplementById(req, res) {
    try {
      const { id } = req.params;
      const complement = await prisma.complement.findUnique({
        where: { id: parseInt(id) }
      });
      if (!complement) {
        return res.status(404).json({ error: "Complement not found" });
      }
      res.status(200).json(complement);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};