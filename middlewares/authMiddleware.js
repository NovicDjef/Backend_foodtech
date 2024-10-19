import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authMiddleware = (requiredRole = 'USER') => async (req, res, next) => {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, phone: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    if (!user.phone || user.phone === "") {
      return res.status(400).json({ message: "Veuillez vérifier votre numéro de téléphone." });
    }

    // Vérification du rôle
    if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Accès refusé. Privilèges d'administrateur requis." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token invalide" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expiré" });
    }
    console.error('Erreur dans le middleware d\'authentification:', error);
    res.status(500).json({ message: "Erreur d'authentification" });
  }
};

export default authMiddleware;