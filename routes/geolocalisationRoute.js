import geolocalisationController from '../controllers/geolocalisationController.js'
import express from 'express'

const router = express.Router()

router.get('/geolocalisations', geolocalisationController.getAllGeolocalisation)
router.get('/geolocalisation/:id', geolocalisationController.getGeolocalisationById)
router.post('/geolocalisation', geolocalisationController.addGeolocalisation)
router.patch('/geolocalisation/:id', geolocalisationController.updateGeolocalisation)
router.delete('/geolocalisation/:id', geolocalisationController.deleteGeolocalisation)

export default router
