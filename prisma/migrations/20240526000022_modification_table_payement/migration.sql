/*
  Warnings:

  - You are about to drop the column `datPayement` on the `Payement` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `Payement` table. All the data in the column will be lost.
  - Added the required column `commandeId` to the `Payement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `Payement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Payement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payement` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `mode_payement` on the `Payement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AlterTable
ALTER TABLE "Payement" DROP COLUMN "datPayement",
DROP COLUMN "updateAt",
ADD COLUMN     "commandeId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "mode_payement",
ADD COLUMN     "mode_payement" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Payement" ADD CONSTRAINT "Payement_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
