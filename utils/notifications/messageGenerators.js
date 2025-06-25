const getVehiculeEmoji = (typeVehicule) => {
  const emojis = {
    MOTO: ' 🏍️',
    SCOOTER: ' 🛵',
    VELO: ' 🚲',
    VOITURE: ' 🚗'
  };
  return emojis[typeVehicule] || ' 🚗';
};

const getTempsEstime = (typeVehicule) => {
  const temps = {
    MOTO: '15-20 min',
    SCOOTER: '20-25 min',
    VELO: '25-35 min',
    VOITURE: '20-30 min'
  };
  return temps[typeVehicule] || '20-30 min';
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bon appétit ! 🌅";
  if (hour < 18) return "Bon déjeuner ! ☀️";
  return "Bon dîner ! 🌙";
};

/**
 * Génére le contenu d'une notification client selon le statut
 */
const generateClientMessage = (status, commande, livreurInfo, extraData = {}) => {
  const platName = commande.plat?.name || 'votre commande';
  const livreurNom = livreurInfo?.prenom || 'le livreur';
  const restaurantName =
    extraData.restaurantName ||
    commande.plat?.categorie?.menu?.restaurant?.name ||
    'le restaurant';

  switch (status) {
    case 'VALIDER':
      const vehiculeEmoji = getVehiculeEmoji(livreurInfo?.typeVehicule);
      return {
        title: "Commande acceptée ✅",
        body: `${livreurNom} (${livreurInfo?.typeVehicule?.toLowerCase() || 'livreur'}${vehiculeEmoji}) a accepté votre commande "${platName}". Préparation en cours...`,
        type: 'COMMANDE_ACCEPTEE'
      };

    case 'EN_COURS':
      const tempsEstime = getTempsEstime(livreurInfo?.typeVehicule);
      return {
        title: "En route vers vous 🏍️",
        body: `${livreurNom} a récupéré votre commande chez ${restaurantName}. En route vers vous ! ETA: ${tempsEstime}`,
        type: 'COMMANDE_EN_ROUTE'
      };

    case 'LIVREE':
      const greeting = getTimeGreeting();
      return {
        title: "Commande livrée ✅",
        body: `Votre commande "${platName}" a été livrée avec succès par ${livreurNom}. ${greeting}`,
        type: 'COMMANDE_LIVREE'
      };

    case 'ANNULEE':
      const raison = extraData.raison || 'Commande annulée par le système';
      return {
        title: "Commande annulée ❌",
        body: `Votre commande "${platName}" a été annulée. Raison: ${raison}. Nous vous rembourserons si un paiement a été effectué.`,
        type: 'COMMANDE_ANNULEE'
      };

    default:
      return null;
  }
};

export default generateClientMessage

