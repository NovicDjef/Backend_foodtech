/*
  Warnings:

  - You are about to drop the column `platsId` on the `Categorie` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `Categorie` table. All the data in the column will be lost.
  - You are about to drop the column `platsId` on the `FavoritePlats` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `FavoritePlats` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `menuId` on the `Plats` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `Plats` table. All the data in the column will be lost.
  - You are about to drop the column `menuId` on the `Restaurant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Categorie" DROP CONSTRAINT "Categorie_platsId_fkey";

-- DropForeignKey
ALTER TABLE "FavoritePlats" DROP CONSTRAINT "FavoritePlats_platsId_fkey";

-- DropForeignKey
ALTER TABLE "FavoritePlats" DROP CONSTRAINT "FavoritePlats_userId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- DropForeignKey
ALTER TABLE "Plats" DROP CONSTRAINT "Plats_menuId_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_menuId_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_platsId_fkey";

-- AlterTable
ALTER TABLE "Categorie" DROP COLUMN "platsId",
DROP COLUMN "restaurantId";

-- AlterTable
ALTER TABLE "FavoritePlats" DROP COLUMN "platsId",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Menu" ADD COLUMN     "restaurantId" INTEGER;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Plats" DROP COLUMN "menuId",
DROP COLUMN "restaurantId",
ADD COLUMN     "categorieId" INTEGER,
ADD COLUMN     "favoritePlatsId" INTEGER;

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "menuId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "favoritePlatsId" INTEGER,
ADD COLUMN     "noteId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_favoritePlatsId_fkey" FOREIGN KEY ("favoritePlatsId") REFERENCES "FavoritePlats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plats" ADD CONSTRAINT "Plats_favoritePlatsId_fkey" FOREIGN KEY ("favoritePlatsId") REFERENCES "FavoritePlats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plats" ADD CONSTRAINT "Plats_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
