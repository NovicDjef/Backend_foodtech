/*
  Warnings:

  - You are about to drop the column `lu` on the `NotificationHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NotificationHistory" DROP COLUMN "lu",
ADD COLUMN     "commandeId" INTEGER,
ADD COLUMN     "send" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AlterTable
ALTER TABLE "_ArticleToMenusrapide" ADD CONSTRAINT "_ArticleToMenusrapide_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ArticleToMenusrapide_AB_unique";

-- AlterTable
ALTER TABLE "_CommandeToMenusrapide" ADD CONSTRAINT "_CommandeToMenusrapide_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CommandeToMenusrapide_AB_unique";

-- AlterTable
ALTER TABLE "_FavoritePlatsToMenusrapide" ADD CONSTRAINT "_FavoritePlatsToMenusrapide_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FavoritePlatsToMenusrapide_AB_unique";

-- AlterTable
ALTER TABLE "_FavoritePlatsToPlats" ADD CONSTRAINT "_FavoritePlatsToPlats_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FavoritePlatsToPlats_AB_unique";

-- AlterTable
ALTER TABLE "_LivraisonToServiceLivraison" ADD CONSTRAINT "_LivraisonToServiceLivraison_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_LivraisonToServiceLivraison_AB_unique";

-- AlterTable
ALTER TABLE "_MenusrapideToNote" ADD CONSTRAINT "_MenusrapideToNote_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MenusrapideToNote_AB_unique";

-- AlterTable
ALTER TABLE "_PlatsToComplement" ADD CONSTRAINT "_PlatsToComplement_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PlatsToComplement_AB_unique";
