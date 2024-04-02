import noteController from '../controllers/noteController.js'
import express from 'express'

const router = express.Router()

router.get('/note', noteController.getAllNote)
router.get('/note/:id', noteController.getNoteById)
router.post('/note', noteController.addNote)
router.patch('/note/:id', noteController.updateNote)
router.delete('/note/:id', noteController.deleteNote)

export default router
