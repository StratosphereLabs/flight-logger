-- DropForeignKey
ALTER TABLE "flight" DROP CONSTRAINT "flight_airlineId_fkey";

-- AlterTable
ALTER TABLE "flight" ALTER COLUMN "airlineId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_airlineId_fkey" FOREIGN KEY ("airlineId") REFERENCES "airline"("id") ON DELETE SET NULL ON UPDATE CASCADE;
