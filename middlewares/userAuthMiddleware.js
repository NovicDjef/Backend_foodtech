// import jwt from 'jsonwebtoken';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// const userAuthMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).json({ message: "Authentification requise" });
//     }

//     const token = authHeader.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ message: "Format de token invalide" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Vérifiez si userId existe dans le token décodé
//     if (!decoded.userId) {
//       return res.status(401).json({ message: "Token invalide: userId manquant" });
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId  },
//       select: { id: true, username: true, phone: true }
//     });

//     if (!user) {
//       return res.status(401).json({ message: "Utilisateur non trouvé" });
//     }

//     req.user = user;  // Ajoute l'utilisateur à la requête
//     next();
//   } catch (error) {
//     console.error('Erreur détaillée:', error);
//     if (error instanceof jwt.JsonWebTokenError) {
//       return res.status(401).json({ message: "Token invalide", details: error.message });
//     }
//     if (error instanceof jwt.TokenExpiredError) {
//       return res.status(401).json({ message: "Token expiré" });
//     }
//     res.status(500).json({ message: "Erreur d'authentification", details: error.message });
//   }
// };

// export default userAuthMiddleware;


import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
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

    if (decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true, phone: true }
      });

      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      req.user = user;
    } else if (decoded.livreurId) {
      const livreur = await prisma.livreur.findUnique({
        where: { id: decoded.livreurId },
        select: { id: true, username: true, prenom: true, email: true, telephone: true }
      });

      if (!livreur) {
        return res.status(401).json({ message: "Livreur non trouvé" });
      }

      req.livreur = livreur;
    } else {
      return res.status(401).json({ message: "Token invalide: ID manquant" });
    }

    next();
  } catch (error) {
    console.error('Erreur auth:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token invalide", details: error.message });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expiré" });
    }
    res.status(500).json({ message: "Erreur d'authentification", details: error.message });
  }
};

export default authMiddleware;

