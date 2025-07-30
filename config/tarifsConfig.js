// config/tarifsConfig.js
export const COMMISSIONS_DEFAULT = {
  REPAS: 0.60,  // 60% sur les repas
  COLIS: 0.65,  // 65% sur les colis (plus de logistique)
  GAZ: 0.55     // 55% sur le gaz (moins de risque)
};

export const TARIFS_LIVRAISON = {
  REPAS: {
    base: 500,
    weekend: 1.2,    // +20% le weekend
    nuit: 1.3,       // +30% la nuit (20h-6h)
    distance: 50     // +50 FCFA par km supplémentaire
  },
  COLIS: {
    base: 800,
    parKg: 200,
    weekend: 1.15,
    nuit: 1.25
  },
  GAZ: {
    // Le deliveryPrice est déjà défini dans GasOrder
    weekend: 1.1,
    nuit: 1.2
  }
};

// Fonction utilitaire pour calculer les prix
export const calculerPrixLivraison = (type, donnees = {}) => {
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const isNight = now.getHours() >= 20 || now.getHours() <= 6;
  
  let prix = 0;
  
  switch (type) {
    case 'REPAS': {
      prix = TARIFS_LIVRAISON.REPAS.base;
      if (isWeekend) prix *= TARIFS_LIVRAISON.REPAS.weekend;
      if (isNight) prix *= TARIFS_LIVRAISON.REPAS.nuit;
      // Ajouter distance si fournie
      if (donnees.distance) {
        prix += (donnees.distance * TARIFS_LIVRAISON.REPAS.distance);
      }
      break;
    }
    
    case 'COLIS': {
      prix = TARIFS_LIVRAISON.COLIS.base;
      if (donnees.poids) {
        prix += (donnees.poids * TARIFS_LIVRAISON.COLIS.parKg);
      }
      if (isWeekend) prix *= TARIFS_LIVRAISON.COLIS.weekend;
      if (isNight) prix *= TARIFS_LIVRAISON.COLIS.nuit;
      break;
    }
    
    case 'GAZ': {
      // Pour le gaz, utiliser le deliveryPrice existant
      prix = donnees.deliveryPrice || 0;
      if (isWeekend) prix *= TARIFS_LIVRAISON.GAZ.weekend;
      if (isNight) prix *= TARIFS_LIVRAISON.GAZ.nuit;
      break;
    }
  }
  
  return Math.round(prix); // Arrondir au FCFA près
};