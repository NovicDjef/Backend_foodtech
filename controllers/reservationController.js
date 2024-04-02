
import pkg from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


const { PrismaClient } = pkg
const prisma = new PrismaClient()

const { reservation: Reservation } = prisma


export default {
    getAllReservation(req, res) {
        Reservation.findMany()
      .then((data) => {
        if (data.length>0) {
          res.status(200).json(data)
        } else {
          res.status(404).json({ message: 'not found data' })
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: 'Somthing went Wrong',
          error: error,
        })
      })
  },

  getReservationById(req, res) {
    const id = req.params.id
    console.log(id)
    Reservation.findUnique({ where: { id: parseInt(id) } })
      .then((data) => {
        if (data) {
          res.status(200).json(data)
        } else {
          res.status(404).json({ message: 'not found data' })
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: 'Somthing went Wrong',
          error: error,
        })
      })
  },

  addReservation(req, res) {
    const reservation = {
        numero_table: req.body.numero_table,
        nombre_personne: req.body.nombre_personne,
        prix_reservation: req.body.prix_reservation,
        userId : req.body.userId ,

    }
    Reservation.create({ data: reservation })
      .then((result) => {
        res.status(200).json({
          message: 'Intervention Materiel create success',
          result,
        })
      })
      .catch((error) => {
        res.status(500).json({
          message: 'Somthing went Wrong',
          error: error,
        })
      })
  },
  deleteReservation(req, res) {
    const id = req.params.id
    Reservation.delete({ where: { id: parseInt(id) } })
      .then((result) => {
        res.status(201).json({
          message: 'Reservation Materiel delete success',
          result,
        })
      })
      .catch((error) => {
        res.status(500).json({
          message: 'Somthing went Wrong',
          error: error,
        })
      })
  },
  updateReservation(req, res) {
    const id = req.params.id
    const reservation = {
        numero_table: req.body.numero_table,
        nombre_personne: req.body.nombre_personne,
        prix_reservation: req.body.prix_reservation,
        userId : req.body.userId ,
        
    }
    Reservation.updateMany({ data: reservation }, { where: { id: parseInt(id) } })
      .then((result) => {
        res.status(201).json({
          message: 'Note Materiel update success',
          result,
        })
      })
      .catch((error) => {
        res.status(500).json({
          message: 'Somthing went Wrong',
          error: error,
        })
      })
  },
}