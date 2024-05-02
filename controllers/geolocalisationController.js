import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { geolocalisation: Geolocalisation } = prisma;

export default {
  async getAllGeolocalisation(req, res) {
    try {
      const data = await Geolocalisation.findMany({
        // include: {
        //   user: true
        // }
      });
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async getGeolocalisationById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = await Geolocalisation.findUnique({ 
        where: { id: id },
        include: {
          user: true
        }
       });
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'not found data' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async addGeolocalisation(req, res) {
    try {
      const geolocalisation = {
        // name_point_localise: req.body.name_point_localise,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        // include: {
        //   user: true
        // }
      };
      const result = await Geolocalisation.create({ data: geolocalisation });
      res.status(200).json({
        message: 'Intervention Materiel create success',
        result,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async deleteGeolocalisation(req, res) {
    try {
      const id = parseInt(req.params.id);
      const result = await Geolocalisation.delete({ 
        where: { id: id },
        include: {
          user: true
        } });
      res.status(201).json({
        message: 'Geolocalisation Materiel delete success',
        result,
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },

  async updateGeolocalisation(req, res) {
    try {
      const id = parseInt(req.params.id);
      const geolocalisation = {
        // name_point_localise: req.body.name_point_localise,
        longitude: req.body.longitude,
        Latitude: req.body.Latitude,
      };
      const result = await Geolocalisation.updateMany({
        data: geolocalisation,
        where: { id: id },
      });
      res.status(201).json({
        message: 'Geolocalisation update success',
        result,
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
