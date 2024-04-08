/*
  Warnings:

  - You are about to drop the column `geolocalisationId` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `historiqueId` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `articleId` on the `Commande` table. All the data in the column will be lost.
  - You are about to drop the column `commandeId` on the `Historique` table. All the data in the column will be lost.
  - You are about to drop the column `commandeId` on the `Livraison` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Livraison` table. All the data in the column will be lost.
  - You are about to drop the column `reatedAt` on the `Payement` table. All the data in the column will be lost.
  - You are about to drop the column `CommandeId` on the `Plats` table. All the data in the column will be lost.
  - You are about to drop the column `articleId` on the `Plats` table. All the data in the column will be lost.
  - You are about to drop the column `articleId` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `platsId` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `reservationId` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `articleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `favoritePlatsId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `historiqueId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `noteId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `payementId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_CategorieToPlats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CommandeToServiceLivraison` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GeolocalisationToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_geolocalisationId_fkey";

-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_historiqueId_fkey";

-- DropForeignKey
ALTER TABLE "Commande" DROP CONSTRAINT "Commande_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Historique" DROP CONSTRAINT "Historique_commandeId_fkey";

-- DropForeignKey
ALTER TABLE "Livraison" DROP CONSTRAINT "Livraison_commandeId_fkey";

-- DropForeignKey
ALTER TABLE "Livraison" DROP CONSTRAINT "Livraison_userId_fkey";

-- DropForeignKey
ALTER TABLE "Plats" DROP CONSTRAINT "Plats_CommandeId_fkey";

-- DropForeignKey
ALTER TABLE "Plats" DROP CONSTRAINT "Plats_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_reservationId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_articleId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_favoritePlatsId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_historiqueId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_noteId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_payementId_fkey";

-- DropForeignKey
ALTER TABLE "_CategorieToPlats" DROP CONSTRAINT "_CategorieToPlats_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategorieToPlats" DROP CONSTRAINT "_CategorieToPlats_B_fkey";

-- DropForeignKey
ALTER TABLE "_CommandeToServiceLivraison" DROP CONSTRAINT "_CommandeToServiceLivraison_A_fkey";

-- DropForeignKey
ALTER TABLE "_CommandeToServiceLivraison" DROP CONSTRAINT "_CommandeToServiceLivraison_B_fkey";

-- DropForeignKey
ALTER TABLE "_GeolocalisationToUser" DROP CONSTRAINT "_GeolocalisationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GeolocalisationToUser" DROP CONSTRAINT "_GeolocalisationToUser_B_fkey";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "geolocalisationId",
DROP COLUMN "historiqueId";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "platsId" INTEGER,
ADD COLUMN     "restaurantId" INTEGER,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Commande" DROP COLUMN "articleId",
ADD COLUMN     "adminId" INTEGER,
ADD COLUMN     "historiqueId" INTEGER,
ADD COLUMN     "livraisonId" INTEGER,
ADD COLUMN     "serviceLivraisonId" INTEGER;

-- AlterTable
ALTER TABLE "FavoritePlats" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Geolocalisation" ADD COLUMN     "adminId" INTEGER,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Historique" DROP COLUMN "commandeId",
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Livraison" DROP COLUMN "commandeId",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "platsId" INTEGER,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Payement" DROP COLUMN "reatedAt",
ADD COLUMN     "commandeId" INTEGER,
ADD COLUMN     "paymentDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Plats" DROP COLUMN "CommandeId",
DROP COLUMN "articleId",
ADD COLUMN     "categorieId" INTEGER,
ADD COLUMN     "commandeId" INTEGER,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "prix_plat" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "restaurantId" INTEGER;

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "articleId",
DROP COLUMN "platsId",
DROP COLUMN "reservationId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "articleId",
DROP COLUMN "favoritePlatsId",
DROP COLUMN "historiqueId",
DROP COLUMN "noteId",
DROP COLUMN "payementId";

-- DropTable
DROP TABLE "_CategorieToPlats";

-- DropTable
DROP TABLE "_CommandeToServiceLivraison";

-- DropTable
DROP TABLE "_GeolocalisationToUser";

-- CreateTable
CREATE TABLE "_AdminToHistorique" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AdminToHistorique_AB_unique" ON "_AdminToHistorique"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminToHistorique_B_index" ON "_AdminToHistorique"("B");

-- AddForeignKey
ALTER TABLE "Plats" ADD CONSTRAINT "Plats_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plats" ADD CONSTRAINT "Plats_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_historiqueId_fkey" FOREIGN KEY ("historiqueId") REFERENCES "Historique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_serviceLivraisonId_fkey" FOREIGN KEY ("serviceLivraisonId") REFERENCES "ServiceLivraison"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_livraisonId_fkey" FOREIGN KEY ("livraisonId") REFERENCES "Livraison"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_platsId_fkey" FOREIGN KEY ("platsId") REFERENCES "Plats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_platsId_fkey" FOREIGN KEY ("platsId") REFERENCES "Plats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payement" ADD CONSTRAINT "Payement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payement" ADD CONSTRAINT "Payement_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Geolocalisation" ADD CONSTRAINT "Geolocalisation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Geolocalisation" ADD CONSTRAINT "Geolocalisation_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique" ADD CONSTRAINT "Historique_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritePlats" ADD CONSTRAINT "FavoritePlats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToHistorique" ADD CONSTRAINT "_AdminToHistorique_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToHistorique" ADD CONSTRAINT "_AdminToHistorique_B_fkey" FOREIGN KEY ("B") REFERENCES "Historique"("id") ON DELETE CASCADE ON UPDATE CASCADE;
