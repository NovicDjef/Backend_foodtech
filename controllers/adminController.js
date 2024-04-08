import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const { admin: Admin } = prisma;

export default {
  async signUpAdmin(req, res) {
    try {
      const result = await Admin.findUnique({ where: {  phone: req.body.phone } });

      if (result) {
        return res.status(409).json({ message: 'Email Or Phone already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);

      const user = {
        username: req.body.username,
        email: req.body.email,
        password: hash,
        phone: req.body.phone,
        image: req.file.filename,  // a prendre en compte losrque on veu ajouter l'image
        // historiqueId: req.body.historiqueId,
        // geolocalisationId: req.body.geolocalisationId,
        include: {
          livraison: true,
          User_role: true,
          restaurant: true,
          commande: true,
          geolocalisations: true,
          historique: true
        }
      };

      const createdUser = await Admin.create({ data: user });

      return res.status(200).json({
        message: 'User created successfully',
        result: createdUser,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async getAllAdmin(req, res) {
    try {
      const data = await Admin.findMany({
        include: {
          livraison: true,
          User_role: true,
          restaurant: true,
          commande: true,
          geolocalisations: true,
          historique: true
        }
      });

      if (data.length > 0) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ message: 'No data found' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async getAdminById(req, res) {
    const id = parseInt(req.params.id);

    try {
      const data = await Admin.findUnique({ where: { id } });

      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ message: 'Data not found' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async login(req, res) {
    try {
      const user = await Admin.findUnique({ where: { email: req.body.email, phone: req.body.phone } });

      if (!user) {
        return res.status(401).json({ message: "User doesn't exist" });
      }

      const result = await bcrypt.compare(req.body.password, user.password);

      if (result) {
        const token = jwt.sign(
          {
            email: user.email,
            phone: user.phone,
            userId: user.id,
          },
          'secret'
        );

        return res.status(200).json({
          message: 'Authentication successful',
          user: user,
          token: token,
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },
};

function handleServerError(res, error) {
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong', error: error });
}
