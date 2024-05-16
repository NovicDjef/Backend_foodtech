/*
  Warnings:

  - You are about to drop the column `geolocalisationId` on the `Restaurant` table. All the data in the column will be lost.
  - Added the required column `ratings` to the `Plats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ratings` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_geolocalisationId_fkey";

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AlterTable
ALTER TABLE "Plats" ADD COLUMN     "ratings" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "geolocalisationId",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ratings" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "HeuresOuverture" (
    "id" SERIAL NOT NULL,
    "jour" TEXT NOT NULL,
    "heures" TEXT NOT NULL,
    "restaurantId" INTEGER NOT NULL,

    CONSTRAINT "HeuresOuverture_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HeuresOuverture" ADD CONSTRAINT "HeuresOuverture_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
