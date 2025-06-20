/*
  Warnings:

  - You are about to drop the column `livraisonId` on the `Commande` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Livraison` table. All the data in the column will be lost.
  - Added the required column `commandeId` to the `Livraison` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Livraison` table without a default value. This is not possible if the table is not empty.
  - Made the column `heureLivraison` on table `Livraison` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Commande" DROP CONSTRAINT "Commande_livraisonId_fkey";

-- DropIndex
DROP INDEX "Commande_livraisonId_key";

-- AlterTable
ALTER TABLE "Commande" DROP COLUMN "livraisonId";

-- AlterTable
ALTER TABLE "Livraison" DROP COLUMN "createdAt",
ADD COLUMN     "commandeId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "heureLivraison" SET NOT NULL,
ALTER COLUMN "heureLivraison" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'ASSIGNEE';

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
