/*
  Warnings:

  - You are about to drop the column `livraisonId` on the `Colis` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Colis" DROP CONSTRAINT "Colis_livraisonId_fkey";

-- DropForeignKey
ALTER TABLE "Livraison" DROP CONSTRAINT "Livraison_commandeId_fkey";

-- DropIndex
DROP INDEX "Colis_livraisonId_key";

-- AlterTable
ALTER TABLE "Colis" DROP COLUMN "livraisonId";

-- AlterTable
ALTER TABLE "Livraison" ADD COLUMN     "colisId" INTEGER,
ALTER COLUMN "commandeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_colisId_fkey" FOREIGN KEY ("colisId") REFERENCES "Colis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
