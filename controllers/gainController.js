import { PrismaClient } from '@prisma/client';
import { COMMISSIONS_DEFAULT, calculerPrixLivraison } from '../config/tarifsConfig.js';

const prisma = new PrismaClient();


export default {
  // Calculer et enregistrer un gain de livraison
  async calculerGainLivraison(req, res) {
    try {
      const { livreurId, commandeId, colisId, gasOrderId, typeLivraison } = req.body;
      
      console.log('💰 Calcul gain pour:', { livreurId, typeLivraison, commandeId, colisId, gasOrderId });
      
      // Récupérer les données du livreur
      const livreur = await prisma.livreur.findUnique({
        where: { id: parseInt(livreurId) }
      });
      
      if (!livreur) {
        return res.status(404).json({ error: 'Livreur non trouvé' });
      }
      
      let prixLivraison = 0;
      let pourcentageCommission = 0;
      let referenceId = null;
      
      // Calculer selon le type
      switch (typeLivraison) {
        case 'REPAS': {
          const commande = await prisma.commande.findUnique({
            where: { id: parseInt(commandeId) },
            include: { plat: true }
          });
          
          if (!commande) {
            return res.status(404).json({ error: 'Commande non trouvée' });
          }
          
          prixLivraison = calculerPrixLivraison('REPAS', { 
            distance: 0 // À calculer selon la position si nécessaire
          });
          pourcentageCommission = livreur.commissionRepas || COMMISSIONS_DEFAULT.REPAS;
          referenceId = commandeId;
          break;
        }
        
        case 'COLIS': {
          const colis = await prisma.colis.findUnique({
            where: { id: parseInt(colisId) }
          });
          
          if (!colis) {
            return res.status(404).json({ error: 'Colis non trouvé' });
          }
          
          prixLivraison = calculerPrixLivraison('COLIS', { 
            poids: colis.poids || 1
          });
          pourcentageCommission = livreur.commissionColis || COMMISSIONS_DEFAULT.COLIS;
          referenceId = colisId;
          break;
        }
        
        case 'GAZ': {
          const gasOrder = await prisma.gasOrder.findUnique({
            where: { id: parseInt(gasOrderId) }
          });
          
          if (!gasOrder) {
            return res.status(404).json({ error: 'Commande gaz non trouvée' });
          }
          
          prixLivraison = calculerPrixLivraison('GAZ', { 
            deliveryPrice: gasOrder.deliveryPrice
          });
          pourcentageCommission = livreur.commissionGaz || COMMISSIONS_DEFAULT.GAZ;
          referenceId = gasOrderId;
          break;
        }
        
        default:
          return res.status(400).json({ error: 'Type de livraison non reconnu' });
      }
      
      const montantGagne = prixLivraison * pourcentageCommission;
      
      // Enregistrer le gain
      const gainLivreur = await prisma.gainLivreur.create({
        data: {
          livreurId: parseInt(livreurId),
          commandeId: typeLivraison === 'REPAS' ? parseInt(commandeId) : null,
          colisId: typeLivraison === 'COLIS' ? parseInt(colisId) : null,
          gasOrderId: typeLivraison === 'GAZ' ? parseInt(gasOrderId) : null,
          typeLivraison,
          prixLivraison,
          pourcentageCommission,
          montantGagne,
          status: 'DISPONIBLE'
        }
      });
      
      // Mettre à jour le total des gains du livreur
      await prisma.livreur.update({
        where: { id: parseInt(livreurId) },
        data: {
          totalGains: { increment: montantGagne },
          gainsDisponibles: { increment: montantGagne },
          totalLivraisons: { increment: 1 }
        }
      });
      
      console.log('✅ Gain enregistré:', gainLivreur);
      
      res.json({ 
        success: true, 
        gain: gainLivreur,
        message: `Gain de ${montantGagne} FCFA ajouté`
      });
      
    } catch (error) {
      console.error('❌ Erreur calcul gain:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Récupérer les gains d'un livreur
  async getGainsLivreur(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const gains = await prisma.gainLivreur.findMany({
        where: { livreurId: parseInt(id) },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      });
      
      const livreur = await prisma.livreur.findUnique({
        where: { id: parseInt(id) },
        select: {
          totalGains: true,
          gainsDisponibles: true,
          commissionRepas: true,
          commissionColis: true,
          commissionGaz: true
        }
      });
      
      res.json({ gains, livreur, page: parseInt(page), limit: parseInt(limit) });
      
    } catch (error) {
      console.error('❌ Erreur récupération gains:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Statistiques des gains
  async getStatsGainsLivreur(req, res) {
    try {
      const { id } = req.params;
      
      // Stats par type de livraison
      const statsParType = await prisma.gainLivreur.groupBy({
        by: ['typeLivraison'],
        where: { livreurId: parseInt(id) },
        _sum: { montantGagne: true },
        _count: true,
        _avg: { montantGagne: true }
      });
      
      // Stats par mois (derniers 6 mois)
      const sixMoisAgo = new Date();
      sixMoisAgo.setMonth(sixMoisAgo.getMonth() - 6);
      
      const statsParMois = await prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as mois,
          SUM(montantGagne) as total,
          COUNT(*) as nombre_livraisons
        FROM gains_livreur 
        WHERE livreurId = ${parseInt(id)} 
          AND createdAt >= ${sixMoisAgo}
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY mois DESC
      `;
      
      res.json({ 
        statsParType, 
        statsParMois,
        periode: '6 derniers mois'
      });
      
    } catch (error) {
      console.error('❌ Erreur stats gains:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Retirer des gains (optionnel)
 async retirerGains(req, res) {
    try {
      const { id } = req.params;
      const { montant } = req.body;
      
      const livreur = await prisma.livreur.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!livreur) {
        return res.status(404).json({ error: 'Livreur non trouvé' });
      }
      
      if (livreur.gainsDisponibles < montant) {
        return res.status(400).json({ error: 'Montant supérieur aux gains disponibles' });
      }
      
      // Mettre à jour les gains du livreur
      await prisma.livreur.update({
        where: { id: parseInt(id) },
        data: {
          gainsDisponibles: { decrement: montant }
        }
      });
      
      // Marquer les gains correspondants comme retirés
      // (logique simplifiée - en réalité il faudrait être plus précis)
      await prisma.gainLivreur.updateMany({
        where: {
          livreurId: parseInt(id),
          status: 'DISPONIBLE'
        },
        data: {
          status: 'RETIRE',
          dateRetrait: new Date()
        }
      });
      
      res.json({ 
        success: true, 
        message: `Retrait de ${montant} FCFA effectué`,
        nouveauSolde: livreur.gainsDisponibles - montant
      });
      
    } catch (error) {
      console.error('❌ Erreur retrait gains:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Mettre à jour les commissions d'un livreur
  async updateCommissionsLivreur(req, res) {
    try {
      const { id } = req.params;
      const { commissionRepas, commissionColis, commissionGaz } = req.body;
      
      const livreur = await prisma.livreur.update({
        where: { id: parseInt(id) },
        data: {
          ...(commissionRepas && { commissionRepas: parseFloat(commissionRepas) }),
          ...(commissionColis && { commissionColis: parseFloat(commissionColis) }),
          ...(commissionGaz && { commissionGaz: parseFloat(commissionGaz) })
        }
      });
      
      res.json({ 
        success: true, 
        livreur: {
          id: livreur.id,
          commissionRepas: livreur.commissionRepas,
          commissionColis: livreur.commissionColis,
          commissionGaz: livreur.commissionGaz
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur mise à jour commissions:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
