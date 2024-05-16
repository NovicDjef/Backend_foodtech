import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export default {
  async getAllHeuresOuverture(req, res) {
    try {
      const heuresOuverture = await prisma.heuresOuverture.findMany();

      if (heuresOuverture.length > 0) {
        return res.status(200).json(heuresOuverture);
      } else {
        return res.status(404).json({ message: 'No opening hours found' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async getHeuresOuvertureByRestaurant(req, res) {
    const restaurantId = parseInt(req.params.restaurantId);

    try {
      const heuresOuverture = await prisma.heuresOuverture.findMany({
        where: { restaurantId },
      });

      if (heuresOuverture.length > 0) {
        return res.status(200).json(heuresOuverture);
      } else {
        return res.status(404).json({ message: 'No opening hours found for this restaurant' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async addHeuresOuverture(req, res) {
    const { jour, heures, restaurantId } = req.body;

    try {
      const createdHeuresOuverture = await prisma.heuresOuverture.create({
        data: { jour, heures, restaurantId },
      });

      return res.status(200).json({
        message: 'Opening hours created successfully',
        result: createdHeuresOuverture,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async deleteHeuresOuverture(req, res) {
    const id = parseInt(req.params.id);

    try {
      const deletedHeuresOuverture = await prisma.heuresOuverture.delete({ where: { id } });

      return res.status(201).json({
        message: 'Opening hours deleted successfully',
        result: deletedHeuresOuverture,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async updateHeuresOuverture(req, res) {
    const id = parseInt(req.params.id);
    const { jour, heures } = req.body;

    try {
      const updatedHeuresOuverture = await prisma.heuresOuverture.update({
        where: { id },
        data: { jour, heures },
      });

      return res.status(201).json({
        message: 'Opening hours updated successfully',
        result: updatedHeuresOuverture,
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
