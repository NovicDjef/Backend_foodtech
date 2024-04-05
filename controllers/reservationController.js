import pkg from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const { PrismaClient } = pkg
const prisma = new PrismaClient()

const { reservation: Reservation } = prisma

export default {
  async getAllReservation(req, res) {
    try {
      const data = await Reservation.findMany();
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Something went wrong',
        error: error,
      });
    }
  },

  async getReservationById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = await Reservation.findUnique({ where: { id } });
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Something went wrong',
        error: error,
      });
    }
  },

  async addReservation(req, res) {
    try {
      const reservation = {
        numero_table: req.body.numero_table,
        nombre_personne: req.body.nombre_personne,
        prix_reservation: req.body.prix_reservation,
        userId: req.body.userId,
      };
      const result = await Reservation.create({ data: reservation });
      res.status(200).json({
        message: 'restaurant create success',
        result,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Something went wrong',
        error: error,
      });
    }
  },

  async deleteReservation(req, res) {
    try {
      const id = parseInt(req.params.id);
      const result = await Reservation.delete({ where: { id } });
      res.status(201).json({
        message: 'restaurant delete success',
        result,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Something went wrong',
        error: error,
      });
    }
  },

  async updateReservation(req, res) {
    try {
      const id = parseInt(req.params.id);
      const reservation = {
        numero_table: req.body.numero_table,
        nombre_personne: req.body.nombre_personne,
        prix_reservation: req.body.prix_reservation,
        userId: req.body.userId,
      };
      const result = await Reservation.updateMany({ data: reservation }, { where: { id } });
      res.status(201).json({
        message: 'restaurant update success',
        result,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Something went wrong',
        error: error,
      });
    }
  },
}
