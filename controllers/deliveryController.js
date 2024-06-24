// deliveryController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const { delivery: Delivery } = prisma;

export default {
  async getDeliveryPrice(req, res) {
    try {
      const distance = parseFloat(req.body.distance);

      if (isNaN(distance) || distance < 0) {
        return res.status(400).json({ message: 'Invalid distance provided' });
      }

      const price = calculateDeliveryPrice(distance);

      res.status(200).json({ distance, price });
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

function calculateDeliveryPrice(distance) {
  if (distance <= 3.5) {
    return 500;
  } else if (distance <= 7.1) {
    return 800;
  } else {
    return 1500;
  }
}

async function handleServerError(res, error) {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong', error });
}
