import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const livreurAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "Format de token invalide" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifiez si livreurId existe dans le token décodé
    if (!decoded.livreurId) {
      return res.status(401).json({ message: "Token invalide: livreurId manquant" });
    }

    const livreur = await prisma.livreur.findUnique({
      where: { id: decoded.livreurId },
      select: { id: true, username: true, email: true }
    });

    if (!livreur) {
      return res.status(401).json({ message: "Livreur non trouvé" });
    }

    req.livreur = livreur;  // Ajoute le livreur à la requête
    next();
  } catch (error) {
    console.error('Erreur détaillée:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token invalide", details: error.message });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expiré" });
    }
    res.status(500).json({ message: "Erreur d'authentification", details: error.message });
  }
};

export default livreurAuthMiddleware;
