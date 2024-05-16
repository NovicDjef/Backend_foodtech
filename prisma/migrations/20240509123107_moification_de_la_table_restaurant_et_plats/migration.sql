-- DropForeignKey
ALTER TABLE "HeuresOuverture" DROP CONSTRAINT "HeuresOuverture_restaurantId_fkey";

-- AlterTable
ALTER TABLE "HeuresOuverture" ALTER COLUMN "restaurantId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OTP" ALTER COLUMN "expiredAt" SET DEFAULT CURRENT_TIMESTAMP + interval '5 minute';

-- AlterTable
ALTER TABLE "Plats" ALTER COLUMN "ratings" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Restaurant" ALTER COLUMN "ratings" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "HeuresOuverture" ADD CONSTRAINT "HeuresOuverture_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
