import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adminAuthMiddleware = async (req, res, next) => {
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

    // Vérifiez si adminId existe dans le token décodé
    if (!decoded.adminId) {
      return res.status(401).json({ message: "Token invalide: adminId manquant" });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, username: true, email: true }
    });

    if (!admin) {
      return res.status(401).json({ message: "Administrateur non trouvé" });
    }

    req.admin = admin;  // Ajoute l'admin à la requête
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

export default adminAuthMiddleware;
