import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, {
  timeout: 120000 // 2 minutes timeout
});

export default {
  async getAllOtp(req, res) {
    try {
      const otps = await prisma.OTP.findMany();
      if (otps.length > 0) {
        res.status(200).json(otps);
      } else {
        res.status(404).json({ message: 'No OTP data found' });
      }
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async getByIdOtp(req, res) {
    const id = parseInt(req.params.id);
    try {
      const otp = await prisma.OTP.findUnique({ where: { id } });
      if (otp) {
        res.status(200).json(otp);
      } else {
        res.status(404).json({ message: "OTP not found" });
      }
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async addPhoneUserOTP(req, res) {
    const { username, phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required." });
    }
    const formattedPhone = phone.startsWith('+') ? phone : `+237${phone}`;
    
    try {
      const existingUser = await prisma.user.findUnique({ where: { phone: formattedPhone } });
      if (existingUser) {
        return res.status(400).json({ 
          message: "This phone number is already in use. Please choose another.",
          error: true
        });
      }

      const newUser = await prisma.user.create({ 
        data: { username, phone: formattedPhone }
      });

      const verification = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
        .verifications
        .create({ to: formattedPhone, channel: 'sms' });

      const otpEntry = await prisma.OTP.create({
        data: {
          phone: formattedPhone,
          verificationSid: verification.sid,
          status: verification.status,
          user: { connect: { id: newUser.id } },
          createdAt: new Date(),
          expiredAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
        },
      });

      res.status(201).json({
        message: "User created successfully and OTP sent",
        user: newUser,
        otpEntry,
        verificationDetails: verification,
      });
    } catch (error) {
      console.error("Error:", error);
      handleServerError(res, error);
    }    
  },

  async verifyOTP(req, res) {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: "Phone number and OTP code are required." });
    }
    const formattedPhone = phone.startsWith('+') ? phone : `+237${phone}`;
    
    try {
      const verificationCheck = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks
        .create({ to: formattedPhone, code });

      if (verificationCheck.status === 'approved') {
        const otpEntry = await prisma.OTP.findFirst({ where: { phone: formattedPhone } });
        if (!otpEntry) {
          return res.status(400).json({ success: false, message: "OTP not found for this phone number." });
        }

        await prisma.OTP.update({
          where: { id: otpEntry.id },
          data: { status: 'approved' },
        });

        res.status(200).json({ success: true, message: "OTP verified successfully." });
      } else {
        res.status(400).json({ success: false, message: "Invalid OTP code." });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      handleServerError(res, error);
    }
  },

  async updateUser(req, res) {
    const id = parseInt(req.params.id);
    const { username, phone } = req.body;
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { username, phone },
      });
      res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

function handleServerError(res, error) {
  console.error('Server error:', error);
  res.status(500).json({ message: 'An error occurred', error: error.message });
}
