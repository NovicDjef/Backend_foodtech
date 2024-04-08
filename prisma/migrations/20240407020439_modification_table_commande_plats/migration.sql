/*
  Warnings:

  - You are about to drop the column `commandeId` on the `Plats` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Plats" DROP CONSTRAINT "Plats_commandeId_fkey";

-- AlterTable
ALTER TABLE "Plats" DROP COLUMN "commandeId";

-- CreateTable
CREATE TABLE "PlatCommande" (
    "id" SERIAL NOT NULL,
    "platId" INTEGER NOT NULL,
    "commandeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "PlatCommande_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlatCommande" ADD CONSTRAINT "PlatCommande_platId_fkey" FOREIGN KEY ("platId") REFERENCES "Plats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatCommande" ADD CONSTRAINT "PlatCommande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
