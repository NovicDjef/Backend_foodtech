const authWithRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ message: "Authentification requise" });

      const token = authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ message: "Format de token invalide" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = null;
      let role = null;

      if (decoded.adminId && allowedRoles.includes('admin')) {
        user = await prisma.admin.findUnique({ where: { id: decoded.adminId } });
        role = 'admin';
        if (user) req.admin = user;
      } else if (decoded.livreurId && allowedRoles.includes('livreur')) {
        user = await prisma.livreur.findUnique({ where: { id: decoded.livreurId } });
        role = 'livreur';
        if (user) req.livreur = user;
      }

      if (!user) {
        return res.status(403).json({ message: "Accès refusé : rôle non autorisé ou utilisateur introuvable" });
      }

      req.userRole = role;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        return res.status(401).json({ message: "Token expiré" });
      if (error instanceof jwt.JsonWebTokenError)
        return res.status(401).json({ message: "Token invalide", details: error.message });
      res.status(500).json({ message: "Erreur d'authentification", details: error.message });
    }
  };
};

export default authWithRoles;
