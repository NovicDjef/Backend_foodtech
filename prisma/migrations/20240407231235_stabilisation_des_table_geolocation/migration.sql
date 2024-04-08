/*
  Warnings:

  - You are about to drop the column `Latitude` on the `Geolocalisation` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `Geolocalisation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Geolocalisation" DROP COLUMN "Latitude",
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Plats" ALTER COLUMN "quantity" SET DEFAULT 1;
