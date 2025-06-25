-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pushToken" TEXT;
