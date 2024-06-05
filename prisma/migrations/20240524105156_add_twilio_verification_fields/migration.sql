/*
  Warnings:

  - Added the required column `status` to the `OTP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verificationSid` to the `OTP` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OTP" ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "verificationSid" TEXT NOT NULL,
ALTER COLUMN "code" DROP NOT NULL,
ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';
