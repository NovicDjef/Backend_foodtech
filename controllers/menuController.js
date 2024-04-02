import pkg from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const { PrismaClient } = pkg
const prisma = new PrismaClient()

const { menu: Menu } = prisma

export default {
  getAllMenu(req, res) {
    Menu.findMany()
      .then((data) => {
        if (data.length > 0) {
          res.status(200).json(data)
        } else {
          res.status(404).json({ message: 'not found data' })
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: 'Somthing went Wrong',
          error: error,
        })
      })
  },

  getMenuById(req, res) {
    const id = req.params.id
    Menu.findUnique({ where: { id: parseInt(id) } })
      .then((data) => {
        if (data.length > 0) {
          res.status(200).json(data)
        } else {
          res.status(404).json({ message: 'not found data' })
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: 'Somthing went Wrong',
          error: error,
        })
      })
  },

 async addMenu(req, res) {
    try {
      const menu = {
        nom_menu: req.body.nom_menu,
        // image_menu: req.file.filename,   //a mettre en place pour l'ajout dynamique des images
        image_menu: req.body.image_menu,
      }

      const createdMenu = await Menu.create({ data: menu });

      return res.status(200).json({
        message: 'Slide created successfully',
        result: createdMenu,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },
  

async deleteMenu(req, res) {
  const id = parseInt(req.params.id);

  try {
    const deletedMenu = await Menu.delete({ where: { id } });

    return res.status(201).json({
      message: 'Slide deleted successfully',
      result: deletedMenu,
    });
  } catch (error) {
    return handleServerError(res, error);
  }
},
    
async updateMenu(req, res) {
  const id = parseInt(req.params.id);
  try {
    const menu = {
      nom_menu: req.body.nom_menu,
      // image_menu: req.file.filename,   //a mettre en place pour l'ajout dynamique des images
      image_menu: req.body.image_menu,
    }

    const updatedMenu = await Menu.updateMany({ where: { id }, data: menu });

    return res.status(201).json({
      message: 'Menu updated successfully',
      result: updatedMenu,
    });
  } catch (error) {
    return handleServerError(res, error);
  }
},
}

function handleServerError(res, error) {
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong', error: error });
}

