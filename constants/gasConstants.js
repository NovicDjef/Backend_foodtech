// ========================================
// constants/gasConstants.js
// ========================================

// Prix du marché camerounais (en FCFA)
export const GAS_PRICES = {
  REFILL: 6500,        // Prix d'une recharge
  FULL_BOTTLE: 30000,  // Prix d'une bouteille pleine
};

// Marques de gaz disponibles au Cameroun
export const GAS_BRANDS = {
  CAM_GAZ: { 
    name: 'Cam Gaz', 
    description: 'Marque nationale camerounaise',
    icon: '🇨🇲'
  },
  TRADEX: { 
    name: 'Tradex', 
    description: 'Marque populaire au Cameroun',
    icon: '🔥'
  },
  BOCCOM: { 
    name: 'Boccom', 
    description: 'Marque de référence',
    icon: '⚡'
  },
  SCTM: { 
    name: 'SCTM', 
    description: 'Société Camerounaise de Transport Maritime',
    icon: '🚢'
  },
  TOTAL_GAS: { 
    name: 'Total Gas', 
    description: 'Marque internationale Total',
    icon: '🌍'
  },
  SHELL_GAS: { 
    name: 'Shell Gas', 
    description: 'Marque internationale Shell',
    icon: '🐚'
  }
};

// Options pour le détendeur
export const REGULATOR_OPTIONS = {
  WITH: {
    name: 'Avec saucle (détendeur)',
    description: 'Inclut le détendeur/régulateur',
    icon: '🔧'
  },
  WITHOUT: {
    name: 'Sans saucle',
    description: 'Bouteille seulement, sans détendeur',
    icon: '⚙️'
  }
};

// Types de commande
export const ORDER_TYPES = {
  REFILL: {
    name: 'Recharge seulement',
    description: 'Recharge de votre bouteille vide',
    price: GAS_PRICES.REFILL,
    icon: '🔄'
  },
  FULL_BOTTLE: {
    name: 'Achat bouteille pleine',
    description: 'Nouvelle bouteille avec gaz',
    price: GAS_PRICES.FULL_BOTTLE,
    icon: '🆕'
  }
};

// Statuts des commandes
export const ORDER_STATUS = {
  GAS_PENDING: {
    name: 'En attente',
    description: 'Commande reçue, en attente de confirmation',
    color: '#F59E0B',
    icon: 'time-outline'
  },
  GAS_CONFIRMED: {
    name: 'Confirmée',
    description: 'Commande confirmée par le vendeur',
    color: '#06B6D4',
    icon: 'checkmark-circle-outline'
  },
  GAS_PREPARING: {
    name: 'En préparation',
    description: 'Commande en cours de préparation',
    color: '#F59E0B',
    icon: 'flame-outline'
  },
  GAS_READY: {
    name: 'Prête',
    description: 'Commande prête pour livraison',
    color: '#8B5CF6',
    icon: 'bag-check-outline'
  },
  GAS_OUT_FOR_DELIVERY: {
    name: 'En livraison',
    description: 'Commande en cours de livraison',
    color: '#06B6D4',
    icon: 'bicycle-outline'
  },
  GAS_DELIVERED: {
    name: 'Livrée',
    description: 'Commande livrée avec succès',
    color: '#10B981',
    icon: 'checkmark-done-circle-outline'
  },
  GAS_CANCELLED: {
    name: 'Annulée',
    description: 'Commande annulée',
    color: '#EF4444',
    icon: 'close-circle-outline'
  },
  GAS_REFUNDED: {
    name: 'Remboursée',
    description: 'Commande remboursée',
    color: '#6B7280',
    icon: 'return-down-back-outline'
  }
};

// Statuts de paiement
export const PAYMENT_STATUS = {
  GAS_PAYMENT_PENDING: {
    name: 'En attente',
    color: '#F59E0B',
    icon: 'card-outline'
  },
  GAS_PAYMENT_PAID: {
    name: 'Payé',
    color: '#10B981',
    icon: 'checkmark-circle'
  },
  GAS_PAYMENT_FAILED: {
    name: 'Échec',
    color: '#EF4444',
    icon: 'close-circle'
  },
  GAS_PAYMENT_REFUNDED: {
    name: 'Remboursé',
    color: '#6B7280',
    icon: 'return-down-back'
  }
};

// Méthodes de paiement
export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: {
    name: 'Paiement à la livraison',
    description: 'Payer en espèces au livreur',
    icon: 'cash-outline'
  },
  MOBILE_MONEY: {
    name: 'Mobile Money',
    description: 'MTN/Orange Money',
    icon: 'phone-portrait-outline'
  },
  BANK_TRANSFER: {
    name: 'Virement bancaire',
    description: 'Virement bancaire direct',
    icon: 'card-outline'
  },
  CARD: {
    name: 'Carte bancaire',
    description: 'Paiement par carte',
    icon: 'card'
  }
};

// Zones de livraison à Douala
export const DELIVERY_ZONES = {
  AKWA: {
    name: 'Akwa',
    basePrice: 1000,
    coordinates: { lat: 4.0511, lng: 9.7679 }
  },
  BONANJO: {
    name: 'Bonanjo',
    basePrice: 1500,
    coordinates: { lat: 4.0483, lng: 9.7042 }
  },
  DEIDO: {
    name: 'Deido',
    basePrice: 800,
    coordinates: { lat: 4.0734, lng: 9.7334 }
  },
  MAKEPE: {
    name: 'Makepe',
    basePrice: 1200,
    coordinates: { lat: 4.0612, lng: 9.7456 }
  },
  BONABERI: {
    name: 'Bonaberi',
    basePrice: 2000,
    coordinates: { lat: 4.0234, lng: 9.6789 }
  }
};

// ========================================
// utils/gasUtils.js
// ========================================

/**
 * Calculer la distance entre deux points GPS
 * @param {number} lat1 - Latitude du point 1
 * @param {number} lon1 - Longitude du point 1
 * @param {number} lat2 - Latitude du point 2
 * @param {number} lon2 - Longitude du point 2
 * @returns {number} Distance en kilomètres
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculer le prix total d'une commande de gaz
 * @param {string} orderType - Type de commande (REFILL ou FULL_BOTTLE)
 * @param {number} quantity - Quantité
 * @param {number} deliveryPrice - Prix de livraison
 * @returns {object} Détails des prix
 */
export function calculateGasOrderPrice(orderType, quantity, deliveryPrice) {
  const basePrice = GAS_PRICES[orderType] || 0;
  const subtotal = basePrice * quantity;
  const total = subtotal + deliveryPrice;
  
  return {
    basePrice,
    subtotal,
    deliveryPrice,
    total
  };
}

/**
 * Obtenir les informations d'un statut de commande
 * @param {string} status - Statut de la commande
 * @returns {object} Informations du statut
 */
export function getOrderStatusInfo(status) {
  return ORDER_STATUS[status] || {
    name: 'Statut inconnu',
    description: 'Statut non reconnu',
    color: '#6B7280',
    icon: 'help-circle-outline'
  };
}

/**
 * Vérifier si une commande peut être annulée
 * @param {string} status - Statut actuel
 * @returns {boolean} True si la commande peut être annulée
 */
export function canCancelOrder(status) {
  const nonCancellableStatuses = [
    'GAS_DELIVERED',
    'GAS_CANCELLED',
    'GAS_REFUNDED'
  ];
  return !nonCancellableStatuses.includes(status);
}

/**
 * Vérifier si une commande peut être évaluée
 * @param {string} status - Statut de la commande
 * @returns {boolean} True si la commande peut être évaluée
 */
export function canReviewOrder(status) {
  return status === 'GAS_DELIVERED';
}

/**
 * Formater un prix en FCFA
 * @param {number} price - Prix à formater
 * @returns {string} Prix formaté
 */
export function formatPrice(price) {
  return `${price.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Formater une date relative
 * @param {Date|string} date - Date à formater
 * @returns {string} Date formatée
 */
export function formatRelativeDate(date) {
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = Math.abs(now - targetDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return `Aujourd'hui à ${targetDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  } else if (diffDays === 2) {
    return `Hier à ${targetDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  } else if (diffDays <= 7) {
    return `Il y a ${diffDays - 1} jour${diffDays > 2 ? 's' : ''}`;
  } else {
    return targetDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}

/**
 * Générer un numéro de commande unique
 * @returns {string} Numéro de commande
 */
export function generateOrderNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `GAS-${timestamp}-${random}`.toUpperCase();
}

/**
 * Valider les données d'une commande de gaz
 * @param {object} orderData - Données de la commande
 * @returns {object} Résultat de la validation
 */
export function validateGasOrder(orderData) {
  const errors = [];
  
  if (!orderData.vendorId) {
    errors.push('Vendeur requis');
  }
  
  if (!orderData.selectedBrand || !Object.keys(GAS_BRANDS).includes(orderData.selectedBrand)) {
    errors.push('Marque de gaz invalide');
  }
  
  if (!orderData.hasRegulator || !Object.keys(REGULATOR_OPTIONS).includes(orderData.hasRegulator)) {
    errors.push('Option détendeur requise');
  }
  
  if (!orderData.orderType || !Object.keys(ORDER_TYPES).includes(orderData.orderType)) {
    errors.push('Type de commande invalide');
  }
  
  if (!orderData.quantity || orderData.quantity < 1) {
    errors.push('Quantité invalide');
  }
  
  if (!orderData.deliveryAddress || orderData.deliveryAddress.trim().length < 10) {
    errors.push('Adresse de livraison trop courte');
  }
  
  if (!orderData.phone || !/^[0-9]{9,}$/.test(orderData.phone)) {
    errors.push('Numéro de téléphone invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Filtrer les vendeurs par distance
 * @param {array} vendors - Liste des vendeurs
 * @param {number} userLat - Latitude utilisateur
 * @param {number} userLon - Longitude utilisateur
 * @param {number} maxRadius - Rayon maximum en km
 * @returns {array} Vendeurs filtrés avec distance
 */
export function filterVendorsByDistance(vendors, userLat, userLon, maxRadius = 10) {
  return vendors
    .map(vendor => ({
      ...vendor,
      distance: calculateDistance(userLat, userLon, vendor.latitude, vendor.longitude)
    }))
    .filter(vendor => vendor.distance <= maxRadius)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Calculer le temps de livraison estimé
 * @param {number} distance - Distance en km
 * @param {string} baseTime - Temps de base du vendeur
 * @returns {string} Temps estimé
 */
export function calculateDeliveryTime(distance, baseTime = "30-45 min") {
  if (distance <= 2) {
    return "15-30 min";
  } else if (distance <= 5) {
    return "30-45 min";
  } else if (distance <= 10) {
    return "45-60 min";
  } else {
    return "60-90 min";
  }
}

/**
 * Obtenir les statistiques d'un vendeur
 * @param {object} vendor - Données du vendeur avec commandes
 * @returns {object} Statistiques calculées
 */
export function calculateVendorStats(vendor) {
  const orders = vendor.gasOrders || [];
  const reviews = vendor.reviews || [];
  
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'GAS_DELIVERED').length;
  const cancelledOrders = orders.filter(o => o.status === 'GAS_CANCELLED').length;
  
  const totalRevenue = orders
    .filter(o => o.status === 'GAS_DELIVERED')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : vendor.rating || 5.0;
  
  return {
    orders: {
      total: totalOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0
    },
    revenue: {
      total: totalRevenue,
      average: completedOrders > 0 ? (totalRevenue / completedOrders).toFixed(0) : 0
    },
    rating: {
      average: parseFloat(avgRating.toFixed(1)),
      totalReviews: reviews.length
    }
  };
}

// ========================================
// validators/gasValidators.js
// ========================================

export const gasVendorSchema = {
  name: { required: true, minLength: 3, maxLength: 100 },
  location: { required: true, minLength: 3, maxLength: 50 },
  address: { required: true, minLength: 10, maxLength: 200 },
  latitude: { required: true, type: 'number', min: -90, max: 90 },
  longitude: { required: true, type: 'number', min: -180, max: 180 },
  deliveryPrice: { required: true, type: 'number', min: 0 },
  deliveryTime: { required: true, pattern: /^\d+-\d+ min$/ },
  availableBrands: { required: true, type: 'array', minItems: 1 }
};

export const gasOrderSchema = {
  vendorId: { required: true, type: 'number' },
  selectedBrand: { required: true, enum: Object.keys(GAS_BRANDS) },
  hasRegulator: { required: true, enum: Object.keys(REGULATOR_OPTIONS) },
  orderType: { required: true, enum: Object.keys(ORDER_TYPES) },
  quantity: { required: true, type: 'number', min: 1, max: 10 },
  deliveryAddress: { required: true, minLength: 10, maxLength: 200 },
  phone: { required: true, pattern: /^[0-9]{9,}$/ }
};

/**
 * Valider un objet selon un schéma
 * @param {object} data - Données à valider
 * @param {object} schema - Schéma de validation
 * @returns {object} Résultat de validation
 */
export function validateSchema(data, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} est requis`);
      continue;
    }
    
    if (value !== undefined && value !== null && value !== '') {
      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`${field} doit être un nombre`);
      }
      
      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} doit être un tableau`);
      }
      
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} doit contenir au moins ${rules.minLength} caractères`);
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} doit contenir au maximum ${rules.maxLength} caractères`);
      }
      
      if (rules.min && value < rules.min) {
        errors.push(`${field} doit être supérieur ou égal à ${rules.min}`);
      }
      
      if (rules.max && value > rules.max) {
        errors.push(`${field} doit être inférieur ou égal à ${rules.max}`);
      }
      
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} doit être l'une des valeurs: ${rules.enum.join(', ')}`);
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} a un format invalide`);
      }
      
      if (rules.type === 'array' && rules.minItems && value.length < rules.minItems) {
        errors.push(`${field} doit contenir au moins ${rules.minItems} élément(s)`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}