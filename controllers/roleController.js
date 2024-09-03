import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

 export default  {
  async createRole(req, res) {
    try {
      const { name } = req.body;

      // Vérifier si le rôle existe déjà
      const existingRole = await prisma.role.findFirst({ where: { name } });
      if (existingRole) {
        return res.status(409).json({ message: "Ce rôle existe déjà" });
      }

      const newRole = await prisma.role.create({
        data: { name }
      });

      res.status(201).json({
        message: "Rôle créé avec succès",
        role: newRole
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async getAllRoles(req, res) {
    try {
      const roles = await prisma.role.findMany({
        include: {
          userRoles: {
            include: {
              admin: true
            }
          }
        }
      });

      res.status(200).json(roles);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const role = await prisma.role.findUnique({
        where: { id: parseInt(id) },
        include: {
          userRoles: {
            include: {
              admin: true
            }
          }
        }
      });

      if (!role) {
        return res.status(404).json({ message: "Rôle non trouvé" });
      }

      res.status(200).json(role);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      // Vérifier si le nouveau nom de rôle existe déjà
      const existingRole = await prisma.role.findFirst({
        where: { 
          name,
          NOT: { id: parseInt(id) }
        }
      });

      if (existingRole) {
        return res.status(409).json({ message: "Un rôle avec ce nom existe déjà" });
      }

      const updatedRole = await prisma.role.update({
        where: { id: parseInt(id) },
        data: { name }
      });

      res.status(200).json({
        message: "Rôle mis à jour avec succès",
        role: updatedRole
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async deleteRole(req, res) {
    try {
      const { id } = req.params;

      // Vérifier si le rôle est utilisé
      const userRoles = await prisma.userRole.findMany({
        where: { roleId: parseInt(id) }
      });

      if (userRoles.length > 0) {
        return res.status(400).json({ 
          message: "Ce rôle ne peut pas être supprimé car il est associé à des utilisateurs"
        });
      }

      await prisma.role.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Rôle supprimé avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  }
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}
