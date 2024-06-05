/*
  Warnings:

  - Added the required column `authorization_url` to the `Payement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AlterTable
ALTER TABLE "Payement" ADD COLUMN     "authorization_url" TEXT NOT NULL;
