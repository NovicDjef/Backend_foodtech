/*
  Warnings:

  - You are about to drop the column `commandeId` on the `Payement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payement" DROP CONSTRAINT "Payement_commandeId_fkey";

-- AlterTable
ALTER TABLE "Commande" ADD COLUMN     "payementId" INTEGER;

-- AlterTable
ALTER TABLE "Payement" DROP COLUMN "commandeId";

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_payementId_fkey" FOREIGN KEY ("payementId") REFERENCES "Payement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
