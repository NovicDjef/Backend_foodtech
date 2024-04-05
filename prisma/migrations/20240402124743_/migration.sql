/*
  Warnings:

  - You are about to drop the column `menuId` on the `Categorie` table. All the data in the column will be lost.
  - You are about to drop the column `categorieId` on the `Plats` table. All the data in the column will be lost.
  - You are about to drop the `Menu` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Categorie" DROP CONSTRAINT "Categorie_menuId_fkey";

-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Plats" DROP CONSTRAINT "Plats_categorieId_fkey";

-- AlterTable
ALTER TABLE "Categorie" DROP COLUMN "menuId";

-- AlterTable
ALTER TABLE "Plats" DROP COLUMN "categorieId",
ADD COLUMN     "restaurantId" INTEGER;

-- DropTable
DROP TABLE "Menu";

-- CreateTable
CREATE TABLE "_CategorieToPlats" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategorieToPlats_AB_unique" ON "_CategorieToPlats"("A", "B");

-- CreateIndex
CREATE INDEX "_CategorieToPlats_B_index" ON "_CategorieToPlats"("B");

-- AddForeignKey
ALTER TABLE "Plats" ADD CONSTRAINT "Plats_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategorieToPlats" ADD CONSTRAINT "_CategorieToPlats_A_fkey" FOREIGN KEY ("A") REFERENCES "Categorie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategorieToPlats" ADD CONSTRAINT "_CategorieToPlats_B_fkey" FOREIGN KEY ("B") REFERENCES "Plats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
