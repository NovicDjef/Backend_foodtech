import pkg from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { slide: Slide } = prisma;

export default {
  async getAllSlide(req, res) {
    try {
      const data = await Slide.findMany();

      if (data.length > 0) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ message: 'No data found' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async getSlideById(req, res) {
    const id = parseInt(req.params.id);

    try {
      const data = await Slide.findUnique({ where: { id } });

      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ message: 'Data not found' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async addSlide(req, res) {
    try {
      const slide = {
        name: req.body.name,
        image: req.file.filename,
      };
      console.warn("scsdssd : ", slide)
      const createdSlide = await Slide.create({ data: slide });
      console.log("scsdssd : ", createdSlide)
      return res.status(200).json({
        message: 'Slide created successfully',
        result: createdSlide,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async deleteSlide(req, res) {
    const id = parseInt(req.params.id);

    try {
      const deletedSlide = await Slide.delete({ where: { id } });

      return res.status(201).json({
        message: 'Slide deleted successfully',
        result: deletedSlide,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async updateSlide(req, res) {
    const id = parseInt(req.params.id);

    try {
      const slide = {
        name: req.body.name,
        image: req.file.filename,  
      };

      const updatedSlide = await Slide.updateMany({ where: { id }, data: slide });

      return res.status(201).json({
        message: 'Slide updated successfully',
        result: updatedSlide,
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
