import express from 'express';
import upload from '../middlewares/multer.js';
import livreurController from '../controllers/livreurController.js';
import gainController from '../controllers/gainController.js';

const router = express.Router();


const validateOtpRequest = (req, res, next) => {
  // Log de la requête
  console.log(`📡 ${req.method} ${req.path}`);
  console.log('📦 Body reçu:', req.body);
  console.log('📋 Headers:', {
    'content-type': req.headers['content-type'],
    'accept': req.headers['accept']
  });

  // Vérification du Content-Type
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    console.error('❌ Content-Type incorrect:', req.headers['content-type']);
    return res.status(400).json({
      success: false,
      message: 'Content-Type doit être application/json',
      received: req.headers['content-type']
    });
  }

  // Vérification que le body existe et n'est pas vide
  if (!req.body || Object.keys(req.body).length === 0) {
    console.error('❌ Body vide ou manquant');
    return res.status(400).json({
      success: false,
      message: 'Corps de la requête requis',
      received: req.body
    });
  }

  next();
};

// Routes pour les livreurs
router.get('/livreurs', livreurController.getAllLivreur);
router.get('/livreur/:id', livreurController.getLivreurById);
router.post('/livreur/signup', upload.single('image'), livreurController.signUpLivreur);
router.post('/livreur/login', livreurController.loginLivreur);
router.delete('/livreur/:id', livreurController.deleteLivreur);
router.patch('/livreur/:id', upload.single('image'), livreurController.updateLivreur);
router.put('/livreur/location', livreurController.updatePositionLivreur);
router.get('livreur/:id/stats', livreurController.getStatsLivreur);
router.post('/livreur/register-push-token', livreurController.postRegisterPushToken);
router.put('/commandes/livreur/location', livreurController.updatePositionLivreurCommande);
router.put('/livreur/status', livreurController.updateLivreurStatus);
router.get('/livreur/:id/status', livreurController.getLivreurStatus);
router.patch('/livreur/:id/disponibilite', livreurController.toggleLivreurDisponibilite);
router.get('/debug/tokens', livreurController.debugTokens);

// Routes bonus
router.patch('/livreur/:id/disponibilite', livreurController.updateDisponibilite);
router.patch('/livreur/:id/position', livreurController.updatePosition);

// ✅ NOUVELLES ROUTES POUR LES GAINS
router.get('/livreur/:id/gains', gainController.getGainsLivreur);
router.get('/livreur/:id/gains/stats', gainController.getStatsGainsLivreur);
router.post('/livreur/:id/gains/retirer', gainController.retirerGains);
router.post('/gains/calculer', gainController.calculerGainLivraison);
router.patch('/livreur/:id/commissions', gainController.updateCommissionsLivreur);


// router.post('/send-otp', livreurController.sendOtp)
// router.post('/verify-otp', livreurController.verifyOtp)
// ✅ ROUTES OTP AVEC MIDDLEWARE DE VALIDATION
router.post('/send-otp', validateOtpRequest, livreurController.sendOtp);
router.post('/verify-otp', validateOtpRequest, livreurController.verifyOtp);

export default router;