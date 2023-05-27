-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "airframeId" TEXT;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_airframeId_fkey" FOREIGN KEY ("airframeId") REFERENCES "airframe"("icao24") ON DELETE SET NULL ON UPDATE CASCADE;
