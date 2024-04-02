import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';



const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { role: Role } = prisma;
const { admin: Admin } = prisma;

export default {
  async getAllRole(req, res) {
    try {
      const data = await Role.findMany();

      if (data.length > 0) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ message: 'No data found' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async getRoleById(req, res) {
    const id = parseInt(req.params.id);

    try {
      const data = await Role.findUnique({ where: { id } });

      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ message: 'Data not found' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async addRole(req, res) {
    try {
      const role = {
        name: req.body.name,
      };

      const createdRole = await Role.create({ data: role });

      return res.status(200).json({
        message: 'Role created successfully',
        result: createdRole,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async deleteRole(req, res) {
    const id = parseInt(req.params.id);

    try {
      const deletedRole = await Role.delete({ where: { id } });

      return res.status(201).json({
        message: 'Role delete success',
        result: deletedRole,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },
};

function handleServerError(res, error) {
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong', error: error });
}
