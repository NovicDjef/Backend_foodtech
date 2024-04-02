
import pkg from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


const { PrismaClient } = pkg
const prisma = new PrismaClient()

const { note: Note } = prisma


export default {
getAllNote(req, res) {
    Note.findMany()
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

  getNoteById(req, res) {
    const id = req.params.id
    console.log(id)
    Note.findUnique({ where: { id: parseInt(id) } })
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

  addNote(req, res) {
    const note = {
    notation: req.body.notation,
    userId : req.body.userId ,
    livraisonId: req.body.livraisonId,

    }
    Note.create({ data: note })
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
  deleteNote(req, res) {
    const id = req.params.id
    Note.delete({ where: { id: parseInt(id) } })
      .then((result) => {
        res.status(201).json({
          message: 'note Materiel delete success',
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
  updateNote(req, res) {
    const id = req.params.id
    const note = {
        notation: req.body.notation,
        userId : req.body.userId ,
        livraisonId: req.body.livraisonId,
    }
    Note.updateMany({ data: note }, { where: { id: parseInt(id) } })
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