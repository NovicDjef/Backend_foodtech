/*
  Warnings:

  - You are about to drop the column `heureAssignation` on the `Livraison` table. All the data in the column will be lost.
  - You are about to drop the column `heureRecuperation` on the `Livraison` table. All the data in the column will be lost.
  - You are about to drop the column `tempsEstime` on the `Livraison` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Colis" ADD COLUMN     "livreurId" INTEGER;

-- AlterTable
ALTER TABLE "Livraison" DROP COLUMN "heureAssignation",
DROP COLUMN "heureRecuperation",
DROP COLUMN "tempsEstime",
ALTER COLUMN "status" SET DEFAULT 'LIVREE';

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_livreurId_fkey" FOREIGN KEY ("livreurId") REFERENCES "Livreur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
