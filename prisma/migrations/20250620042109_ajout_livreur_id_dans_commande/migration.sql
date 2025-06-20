/*
  Warnings:

  - You are about to drop the column `colisId` on the `Livraison` table. All the data in the column will be lost.
  - You are about to drop the column `commandeId` on the `Livraison` table. All the data in the column will be lost.
  - You are about to drop the column `commandeId` on the `NotificationHistory` table. All the data in the column will be lost.
  - You are about to drop the column `send` on the `NotificationHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[livraisonId]` on the table `Colis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[livraisonId]` on the table `Commande` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Livraison" DROP CONSTRAINT "Livraison_colisId_fkey";

-- DropForeignKey
ALTER TABLE "Livraison" DROP CONSTRAINT "Livraison_commandeId_fkey";

-- DropIndex
DROP INDEX "Livraison_colisId_key";

-- DropIndex
DROP INDEX "Livraison_commandeId_key";

-- AlterTable
ALTER TABLE "Colis" ADD COLUMN     "livraisonId" INTEGER;

-- AlterTable
ALTER TABLE "Commande" ADD COLUMN     "livraisonId" INTEGER,
ADD COLUMN     "livreurId" INTEGER;

-- AlterTable
ALTER TABLE "Livraison" DROP COLUMN "colisId",
DROP COLUMN "commandeId";

-- AlterTable
ALTER TABLE "NotificationHistory" DROP COLUMN "commandeId",
DROP COLUMN "send",
ADD COLUMN     "lu" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- CreateIndex
CREATE UNIQUE INDEX "Colis_livraisonId_key" ON "Colis"("livraisonId");

-- CreateIndex
CREATE UNIQUE INDEX "Commande_livraisonId_key" ON "Commande"("livraisonId");

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_livraisonId_fkey" FOREIGN KEY ("livraisonId") REFERENCES "Livraison"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_livreurId_fkey" FOREIGN KEY ("livreurId") REFERENCES "Livreur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_livraisonId_fkey" FOREIGN KEY ("livraisonId") REFERENCES "Livraison"("id") ON DELETE SET NULL ON UPDATE CASCADE;
