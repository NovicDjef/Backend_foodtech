/*
  Warnings:

  - Added the required column `position` to the `Commande` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Plats" DROP CONSTRAINT "Plats_categorieId_fkey";

-- AlterTable
ALTER TABLE "Commande" ADD COLUMN     "position" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AlterTable
ALTER TABLE "Plats" ALTER COLUMN "categorieId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Plats" ADD CONSTRAINT "Plats_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
