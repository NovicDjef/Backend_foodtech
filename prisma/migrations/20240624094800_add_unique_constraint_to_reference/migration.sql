/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Payement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- CreateIndex
CREATE UNIQUE INDEX "Payement_reference_key" ON "Payement"("reference");
