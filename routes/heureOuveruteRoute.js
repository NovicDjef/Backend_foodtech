import express from 'express';
import heuresOuvertureController from '../controllers/heureOuvertureController.js';

const router = express.Router();

router.get('/heures', heuresOuvertureController.getAllHeuresOuverture);
router.get('/restaurants/:id/heures', heuresOuvertureController.getHeuresOuvertureByRestaurant);
router.post('/restaurants/:id/heures', heuresOuvertureController.addHeuresOuverture);
router.post('/api/restaurants/:id/heures/bulk', heuresOuvertureController.addHeuresOuvertureBulk);
router.put('/heures/:id', heuresOuvertureController.updateHeuresOuverture);
router.delete('/heures/:id', heuresOuvertureController.deleteHeuresOuverture);

export default router;
