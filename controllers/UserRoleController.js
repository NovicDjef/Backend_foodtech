// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export default  {
//   async addUserRole(req, res) {
//     try {
//       const { adminId, roleId } = req.body;

//       // Vérifier si l'admin et le rôle existent
//       const admin = await prisma.admin.findUnique({ where: { id: adminId } });
//       const role = await prisma.role.findUnique({ where: { id: roleId } });

//       if (!admin || !role) {
//         return res.status(404).json({ message: "Admin ou Rôle non trouvé" });
//       }

//       // Vérifier si la relation existe déjà
//       const existingUserRole = await prisma.userRole.findUnique({
//         where: {
//           adminId_roleId: {
//             adminId,
//             roleId
//           }
//         }
//       });

//       if (existingUserRole) {
//         return res.status(409).json({ message: "Cette relation Admin-Rôle existe déjà" });
//       }

//       const newUserRole = await prisma.userRole.create({
//         data: {
//           admin: { connect: { id: adminId } },
//           role: { connect: { id: roleId } }
//         },
//         include: {
//           admin: true,
//           role: true
//         }
//       });

//       res.status(201).json({
//         message: "Rôle utilisateur ajouté avec succès",
//         userRole: newUserRole
//       });
//     } catch (error) {
//       handleServerError(res, error);
//     }
//   },

//   async getUserRoles(req, res) {
//     try {
//       const userRoles = await prisma.userRole.findMany({
//         include: {
//           admin: true,
//           role: true
//         }
//       });

//       res.status(200).json(userRoles);
//     } catch (error) {
//       handleServerError(res, error);
//     }
//   },

//   async getUserRolesByAdmin(req, res) {
//     try {
//       const { adminId } = req.params;

//       const userRoles = await prisma.userRole.findMany({
//         where: { adminId: parseInt(adminId) },
//         include: {
//           role: true
//         }
//       });

//       res.status(200).json(userRoles);
//     } catch (error) {
//       handleServerError(res, error);
//     }
//   },

//   async updateUserRole(req, res) {
//     try {
//       const { adminId, oldRoleId, newRoleId } = req.body;

//       // Vérifier si la nouvelle relation n'existe pas déjà
//       const existingNewRole = await prisma.userRole.findUnique({
//         where: {
//           adminId_roleId: {
//             adminId,
//             roleId: newRoleId
//           }
//         }
//       });

//       if (existingNewRole) {
//         return res.status(409).json({ message: "La nouvelle relation Admin-Rôle existe déjà" });
//       }

//       // Supprimer l'ancienne relation
//       await prisma.userRole.delete({
//         where: {
//           adminId_roleId: {
//             adminId,
//             roleId: oldRoleId
//           }
//         }
//       });

//       // Créer la nouvelle relation
//       const updatedUserRole = await prisma.userRole.create({
//         data: {
//           admin: { connect: { id: adminId } },
//           role: { connect: { id: newRoleId } }
//         },
//         include: {
//           admin: true,
//           role: true
//         }
//       });

//       res.status(200).json({
//         message: "Rôle utilisateur mis à jour avec succès",
//         userRole: updatedUserRole
//       });
//     } catch (error) {
//       handleServerError(res, error);
//     }
//   },

//   async deleteUserRole(req, res) {
//     try {
//       const { adminId, roleId } = req.params;

//       await prisma.userRole.delete({
//         where: {
//           adminId_roleId: {
//             adminId: parseInt(adminId),
//             roleId: parseInt(roleId)
//           }
//         }
//       });

//       res.status(200).json({ message: "Rôle utilisateur supprimé avec succès" });
//     } catch (error) {
//       handleServerError(res, error);
//     }
//   }
// };

// function handleServerError(res, error) {
//   console.error('Erreur serveur:', error);
//   res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
// }

