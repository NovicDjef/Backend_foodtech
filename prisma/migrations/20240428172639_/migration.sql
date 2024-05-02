/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `Geolocalisation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Geolocalisation" DROP CONSTRAINT "Geolocalisation_restaurantId_fkey";

-- DropIndex
DROP INDEX "Geolocalisation_restaurantId_key";

-- AlterTable
ALTER TABLE "Geolocalisation" DROP COLUMN "restaurantId";

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "geolocalisationId" INTEGER;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_geolocalisationId_fkey" FOREIGN KEY ("geolocalisationId") REFERENCES "Geolocalisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
