import express from 'express';
import heuresOuvertureController from '../controllers/heureOuvertureController.js';

const router = express.Router();

router.get('/heures-ouvertures', heuresOuvertureController.getAllHeuresOuverture);
router.get('/heures-ouverture/:id', heuresOuvertureController.getHeuresOuvertureByRestaurant);
router.post('/heures-ouverture', heuresOuvertureController.addHeuresOuverture);
router.patch('/heures-ouverture/:id', heuresOuvertureController.updateHeuresOuverture);
router.delete('/heures-ouverture/:id', heuresOuvertureController.deleteHeuresOuverture);

export default router;
