-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "activityId" TEXT,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedBy" TEXT,
ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
