/*
  Warnings:

  - You are about to drop the column `montant` on the `Payement` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Payement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Payement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Payement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Payement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AlterTable
ALTER TABLE "Payement" DROP COLUMN "montant",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;
