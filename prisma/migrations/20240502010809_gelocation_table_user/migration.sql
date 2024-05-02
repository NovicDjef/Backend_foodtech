/*
  Warnings:

  - You are about to drop the column `userId` on the `Geolocalisation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Geolocalisation" DROP CONSTRAINT "Geolocalisation_userId_fkey";

-- DropIndex
DROP INDEX "Geolocalisation_userId_key";

-- AlterTable
ALTER TABLE "Geolocalisation" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "geolocalisationId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_geolocalisationId_fkey" FOREIGN KEY ("geolocalisationId") REFERENCES "Geolocalisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
