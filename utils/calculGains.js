// utils/calculGains.js
export const calculerGainLivraison = async (livraisonData) => {
  const { livreurId, type, commandeId, colisId, gasOrderId } = livraisonData;
  
  // Récupérer les données du livreur
  const livreur = await prisma.livreur.findUnique({
    where: { id: livreurId }
  });
  
  let prixLivraison = 0;
  let pourcentageCommission = 0;
  
  // Déterminer le prix de livraison et la commission selon le type
  switch (type) {
    case 'REPAS': {
      const commande = await prisma.commande.findUnique({
        where: { id: commandeId },
        include: { plat: true }
      });
      
      // Pour les repas, supposons 500 FCFA de base de livraison
      prixLivraison = calculerPrixLivraisonRepas(commande);
      pourcentageCommission = livreur.commissionRepas;
      break;
    }
    
    case 'COLIS': {
      const colis = await prisma.colis.findUnique({
        where: { id: colisId }
      });
      
      // Le prix du colis inclut déjà la livraison, extraire la part livraison
      prixLivraison = calculerPrixLivraisonColis(colis);
      pourcentageCommission = livreur.commissionColis;
      break;
    }
    
    case 'GAZ': {
      const gasOrder = await prisma.gasOrder.findUnique({
        where: { id: gasOrderId }
      });
      
      // Le gaz a un champ deliveryPrice dédié
      prixLivraison = gasOrder.deliveryPrice;
      pourcentageCommission = livreur.commissionGaz;
      break;
    }
  }
  
  const montantGagne = prixLivraison * pourcentageCommission;
  
  return {
    prixLivraison,
    pourcentageCommission,
    montantGagne
  };
};

// Fonctions helper pour calculer les prix de livraison
const calculerPrixLivraisonRepas = (commande) => {
  const prixBase = 500; // Base 500 FCFA
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const isNight = now.getHours() >= 20 || now.getHours() <= 6;
  
  let prix = prixBase;
  if (isWeekend) prix *= 1.2;
  if (isNight) prix *= 1.3;
  
  return prix;
};

const calculerPrixLivraisonColis = (colis) => {
  // Base selon le poids
  const prixParKg = 200;
  const prixBase = 800;
  
  return prixBase + (colis.poids * prixParKg);
};