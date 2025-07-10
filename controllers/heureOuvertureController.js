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
    try {
    const { id } = req.params;
    
    const horaires = await prisma.heuresOuverture.findMany({
      where: { restaurantId: parseInt(id) },
      orderBy: {
        // Ordonner par jour de la semaine
        jour: 'asc'
      }
    });

    res.json(horaires);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des horaires' });
  }
},

  async addHeuresOuverture(req, res) {
    try {
    const { id } = req.params;
    const { jour, heures } = req.body;

    const heureOuverture = await prisma.heuresOuverture.create({
      data: {
        jour,
        heures,
        restaurantId: parseInt(id)
      }
    });

    res.status(201).json(heureOuverture);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création des horaires' });
  }
},

  // POST /api/restaurants/:id/heures/bulk
async addHeuresOuvertureBulk (req, res) {
  try {
    const { id } = req.params;
    const { horaires } = req.body; 

    await prisma.heuresOuverture.deleteMany({
      where: { restaurantId: parseInt(id) }
    });

    // Créer les nouveaux horaires
    const nouveauxHoraires = await prisma.heuresOuverture.createMany({
      data: horaires.map(h => ({
        jour: h.jour,
        heures: h.heures,
        restaurantId: parseInt(id)
      }))
    });

    res.status(201).json(nouveauxHoraires);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création des horaires' });
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
  try {
    const { id } = req.params;
    const { jour, heures } = req.body;

    const heureOuverture = await prisma.heuresOuverture.update({
      where: { id: parseInt(id) },
      data: { jour, heures }
    });

    res.json(heureOuverture);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
},
};

function handleServerError(res, error) {
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong', error: error });
}
