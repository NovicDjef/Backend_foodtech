/*
  Warnings:

  - You are about to drop the column `livraisonId` on the `Colis` table. All the data in the column will be lost.
  - You are about to drop the column `livraisonId` on the `Commande` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[commandeId]` on the table `Livraison` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[colisId]` on the table `Livraison` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `colisId` to the `Livraison` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commandeId` to the `Livraison` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Colis" DROP CONSTRAINT "Colis_livraisonId_fkey";

-- DropForeignKey
ALTER TABLE "Commande" DROP CONSTRAINT "Commande_livraisonId_fkey";

-- DropIndex
DROP INDEX "Colis_livraisonId_key";

-- DropIndex
DROP INDEX "Commande_livraisonId_key";

-- AlterTable
ALTER TABLE "Colis" DROP COLUMN "livraisonId";

-- AlterTable
ALTER TABLE "Commande" DROP COLUMN "livraisonId";

-- AlterTable
ALTER TABLE "Livraison" ADD COLUMN     "colisId" INTEGER NOT NULL,
ADD COLUMN     "commandeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- CreateIndex
CREATE UNIQUE INDEX "Livraison_commandeId_key" ON "Livraison"("commandeId");

-- CreateIndex
CREATE UNIQUE INDEX "Livraison_colisId_key" ON "Livraison"("colisId");

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_colisId_fkey" FOREIGN KEY ("colisId") REFERENCES "Colis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
