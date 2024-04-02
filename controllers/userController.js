import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { user: User } = prisma;

export default {
  async signUpUser(req, res) {
    try {
      const result = await User.findUnique({ where: { phone: req.body.phone  } });

      if (result) {
        return res.status(409).json({ message: 'Phone number already exists' });
      }
      const user = {
        username: req.body.username,
        phone: req.body.phone,
        image: req.body.image,
        // image: req.file.filename,  // a prendre en compte losrque on veu ajouter l'image
        historiqueId: req.body.historiqueId,
        articleId: req.body.articleId,
        payementId: req.body.payementId,
      };

      const createdUser = await User.create({ data: user });

      return res.status(200).json({
        message: 'User created successfully',
        user: createdUser,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async getAllUser(req, res) {
    try {
      const data = await User.findMany();

      if (data.length > 0) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ message: 'No data found' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async getUserById(req, res) {
    const id = parseInt(req.params.id);

    try {
      const data = await User.findUnique({ where: { id } });

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
      const user = await User.findUnique({ where: { phone: req.body.phone } });

      if (!user) {
        return res.status(401).json({ message: "User doesn't exist" });
      }

      const result = await bcrypt.compare(req.body.password, user.password);

      if (result) {
        const token = jwt.sign(
          {
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