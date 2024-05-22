import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { menu: Menu } = prisma;

export default {
  async getAllMenus(req, res) {
    try {
      const data = await Menu.findMany({
        include: {
          categories: {
            include: {
              plats: true
            }
          }
        }
      });
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'No menus found' });
      }
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async getMenuById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = await Menu.findUnique({ 
        where: { id },
        include: {
          categories: {
            include: {
              plats: true
            }
          }
        }
      });
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'Menu not found' });
      }
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async addMenu(req, res) {
    try {
      const menu = {
        name: req.body.name,
        image: req.file.filename,
        description: req.body.description,
        // include: {
        //   categories: true
        // }
      };
      const result = await Menu.create({ data: menu });
      res.status(200).json({
        message: 'Menu created successfully',
        menu: result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async updateMenu(req, res) {
    try {
      const id = parseInt(req.params.id);
      const menu = {
        name: req.body.name,
        image: req.file.filename,
        description: req.body.description,
        // include: {
        //   categories: true
        // }
      };
      const result = await Menu.update({
        where: { id },
        data: menu,
      });
      res.status(201).json({
        message: 'Menu updated successfully',
        result,
      });
    } catch (error) {
      await handleServerError(res, error);
    }
  },

  async deleteMenu(req, res) {
    try {
      const id = parseInt(req.params.id);
      const result = await Menu.delete({ where: { id } });
      res.status(201).json({
        message: 'Menu deleted successfully',
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
