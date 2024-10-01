// Ceci est un exemple. Remplacez cette logique par votre véritable implémentation.
export const getUserTokenFromDatabase = async (userId) => {
  // Simulons une recherche en base de données
  return new Promise((resolve) => {
    setTimeout(() => {
      // Remplacez ceci par votre logique réelle de récupération de token
      const fakeToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      resolve(fakeToken);
    }, 100);
  });
};