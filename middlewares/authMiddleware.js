import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    // Le token est généralement envoyé sous la forme "Bearer [token]"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "Format de token invalide" });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur à partir de l'ID dans le token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, phone: true } // Sélectionner uniquement les champs nécessaires
    });

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

     // Vérifier si l'utilisateur a un numéro de téléphone valide
     if (!user.phone || user.phone === "") {
      return res.status(400).json({ message: "Veuillez vérifier votre numéro de téléphone." });
    }


    // Ajouter l'utilisateur à l'objet req pour une utilisation ultérieure
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