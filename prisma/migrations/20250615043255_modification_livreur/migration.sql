/*
  Warnings:

  - The values [PAYEE] on the enum `ColisStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PAYEE] on the enum `CommandeStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `adresseArrivee` on the `Livraison` table. All the data in the column will be lost.
  - You are about to drop the column `adresseDepart` on the `Livraison` table. All the data in the column will be lost.
  - You are about to drop the column `dateLivraison` on the `Livraison` table. All the data in the column will be lost.
  - You are about to drop the column `serviceLivraisonId` on the `Livraison` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `Livraison` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Livraison` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[commandeId,complementId]` on the table `CommandeComplement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `livreurId` to the `Livraison` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LivraisonStatus" AS ENUM ('ASSIGNEE', 'EN_ROUTE', 'LIVREE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeVehicule" AS ENUM ('MOTO', 'VELO', 'VOITURE', 'SCOOTER');

-- AlterEnum
BEGIN;
CREATE TYPE "ColisStatus_new" AS ENUM ('EN_ATTENTE', 'VALIDER', 'ASSIGNEE', 'EN_COURS', 'LIVREE', 'ANNULEE');
ALTER TABLE "Colis" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Colis" ALTER COLUMN "status" TYPE "ColisStatus_new" USING ("status"::text::"ColisStatus_new");
ALTER TYPE "ColisStatus" RENAME TO "ColisStatus_old";
ALTER TYPE "ColisStatus_new" RENAME TO "ColisStatus";
DROP TYPE "ColisStatus_old";
ALTER TABLE "Colis" ALTER COLUMN "status" SET DEFAULT 'EN_ATTENTE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CommandeStatus_new" AS ENUM ('EN_ATTENTE', 'VALIDER', 'ASSIGNEE', 'EN_COURS', 'LIVREE', 'ANNULEE');
ALTER TABLE "Commande" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Commande" ALTER COLUMN "status" TYPE "CommandeStatus_new" USING ("status"::text::"CommandeStatus_new");
ALTER TYPE "CommandeStatus" RENAME TO "CommandeStatus_old";
ALTER TYPE "CommandeStatus_new" RENAME TO "CommandeStatus";
DROP TYPE "CommandeStatus_old";
ALTER TABLE "Commande" ALTER COLUMN "status" SET DEFAULT 'EN_ATTENTE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Livraison" DROP CONSTRAINT "Livraison_serviceLivraisonId_fkey";

-- AlterTable
ALTER TABLE "Livraison" DROP COLUMN "adresseArrivee",
DROP COLUMN "adresseDepart",
DROP COLUMN "dateLivraison",
DROP COLUMN "serviceLivraisonId",
DROP COLUMN "statut",
DROP COLUMN "type",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "heureAssignation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "heureLivraison" TIMESTAMP(3),
ADD COLUMN     "heureRecuperation" TIMESTAMP(3),
ADD COLUMN     "livreurId" INTEGER NOT NULL,
ADD COLUMN     "status" "LivraisonStatus" NOT NULL DEFAULT 'ASSIGNEE',
ADD COLUMN     "tempsEstime" TEXT;

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- DropEnum
DROP TYPE "LivraisonType";

-- CreateTable
CREATE TABLE "Livreur" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "note" DOUBLE PRECISION DEFAULT 5.0,
    "totalLivraisons" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "positionActuelle" JSONB,
    "pushToken" TEXT,
    "deviceId" TEXT,
    "typeVehicule" "TypeVehicule" NOT NULL DEFAULT 'MOTO',
    "plaqueVehicule" TEXT,

    CONSTRAINT "Livreur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriquePosition" (
    "id" SERIAL NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "livraisonId" INTEGER NOT NULL,
    "livreurId" INTEGER NOT NULL,

    CONSTRAINT "HistoriquePosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationHistory" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "livreurId" INTEGER,

    CONSTRAINT "NotificationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LivraisonToServiceLivraison" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Livreur_email_key" ON "Livreur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Livreur_telephone_key" ON "Livreur"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "_LivraisonToServiceLivraison_AB_unique" ON "_LivraisonToServiceLivraison"("A", "B");

-- CreateIndex
CREATE INDEX "_LivraisonToServiceLivraison_B_index" ON "_LivraisonToServiceLivraison"("B");

-- CreateIndex
CREATE UNIQUE INDEX "CommandeComplement_commandeId_complementId_key" ON "CommandeComplement"("commandeId", "complementId");

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_livreurId_fkey" FOREIGN KEY ("livreurId") REFERENCES "Livreur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriquePosition" ADD CONSTRAINT "HistoriquePosition_livraisonId_fkey" FOREIGN KEY ("livraisonId") REFERENCES "Livraison"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriquePosition" ADD CONSTRAINT "HistoriquePosition_livreurId_fkey" FOREIGN KEY ("livreurId") REFERENCES "Livreur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationHistory" ADD CONSTRAINT "NotificationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationHistory" ADD CONSTRAINT "NotificationHistory_livreurId_fkey" FOREIGN KEY ("livreurId") REFERENCES "Livreur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LivraisonToServiceLivraison" ADD CONSTRAINT "_LivraisonToServiceLivraison_A_fkey" FOREIGN KEY ("A") REFERENCES "Livraison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LivraisonToServiceLivraison" ADD CONSTRAINT "_LivraisonToServiceLivraison_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceLivraison"("id") ON DELETE CASCADE ON UPDATE CASCADE;
