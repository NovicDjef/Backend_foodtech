-- DropForeignKey
ALTER TABLE "Categorie" DROP CONSTRAINT "Categorie_menuId_fkey";

-- AlterTable
ALTER TABLE "Categorie" ALTER COLUMN "menuId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AddForeignKey
ALTER TABLE "Categorie" ADD CONSTRAINT "Categorie_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
