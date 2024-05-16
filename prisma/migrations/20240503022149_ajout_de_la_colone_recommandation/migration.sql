-- AlterTable
ALTER TABLE "Commande" ADD COLUMN     "recommandation" TEXT;

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';
