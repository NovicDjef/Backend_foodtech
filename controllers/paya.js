const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fonction pour ajouter une commande
async function addCommande(req, res) {
  try {
    const { userId, platsId, quantity, prix, recommandation, position, modePaiement } = req.body;

    // Vérifier si l'utilisateur existe
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return res.status(400).json({ message: "Cet utilisateur n'existe pas" });
    }

    // Créer la commande
    const commande = await prisma.commande.create({
      data: {
        quantity,
        prix,
        recommandation,
        position,
        status: modePaiement === 'A_LA_LIVRAISON' ? 'EN_COURS' : 'EN_COURS',
        User: { connect: { id: userId } },
        Plats: { connect: { id: platsId } }
      },
    });

    let payement = null;
    if (modePaiement !== 'A_LA_LIVRAISON') {
      // Créer un paiement si le mode n'est pas à la livraison
      payement = await prisma.payement.create({
        data: {
          amount: prix,
          mode_payement: modePaiement,
          currency: 'XAF', // Ajustez selon votre devise
          status: 'EN_ATTENTE',
          reference: `PAY-${Date.now()}`,
          phone: userExists.phone,
          Commande: { connect: { id: commande.id } },
          User: { connect: { id: userId } }
        },
      });
    }

    res.status(201).json({
      message: 'Votre commande a été créée avec succès.',
      commande,
      payement
    });
  } catch (error) {
    console.error("Erreur lors de la commande :", error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors du traitement de votre commande.' });
  }
}

// Fonction pour gérer le paiement d'une commande
async function handlePayment(req, res) {
  try {
    const { commandeId, transactionDetails } = req.body;

    const commande = await prisma.commande.findUnique({
      where: { id: commandeId },
      include: { Payement: true }
    });

    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    if (!commande.Payement) {
      return res.status(400).json({ message: "Aucun paiement associé à cette commande" });
    }

    // Mettre à jour le statut du paiement
    const updatedPayement = await prisma.payement.update({
      where: { id: commande.Payement.id },
      data: {
        status: 'COMPLETE',
        authorization_url: transactionDetails.authorization_url,
        // Ajoutez d'autres détails de transaction si nécessaire
      }
    });

    // Mettre à jour le statut de la commande
    const updatedCommande = await prisma.commande.update({
      where: { id: commandeId },
      data: { status: 'PAYEE' }
    });

    res.status(200).json({
      message: 'Paiement traité avec succès',
      commande: updatedCommande,
      payement: updatedPayement
    });
  } catch (error) {
    console.error("Erreur lors du traitement du paiement :", error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors du traitement du paiement.' });
  }
}

module.exports = {
  addCommande,
  handlePayment
};