import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { article: Article } = prisma;

export default {
  // CRUD des Articles
  async getAllArticle(req, res) {
    try {
      const data = await Article.findMany({
        include: {
          Restaurant: {
            include: {
              Plats: true,
            },
          }

        }
      });
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async getArticleById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = await Article.findUnique({ 
        where: { id },
        include: {
          Restaurant: {
            include: {
              Plats: true,
            },
          }

        }
       });
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async addArticle(req, res) {
    try {
      const article = {
        title: req.body.title,
        content: req.body.content,
        include: {
          Restaurant: {
            include: {
              Plats: true,
            },
          }

        }
      };
      const result = await Article.create({ data: article });
      res.status(200).json({
        message: 'Intervention Materiel create success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async deleteArticle(req, res) {
    try {
      const id = parseInt(req.params.id);
      const result = await Article.delete({ 
        where: { id },
        include: {
          Restaurant: {
            include: {
              Plats: true,
            },
          }
        }
       });
      res.status(201).json({
        message: 'Article Materiel delete success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async updateArticle(req, res) {
    try {
      const id = parseInt(req.params.id);
      const article = {
        title: req.body.title,
        content: req.body.content,
        include: {
          Restaurant: {
            include: {
              Plats: true,
            },
          }
        }
      };
      const result = await Article.updateMany({ data: article }, { where: { id } });
      res.status(201).json({
        message: 'Article Materiel update success',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },
};

async function handleServerError(res, error) {
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong', error: error });
}
