-- CreateEnum
CREATE TYPE "FlightRadarStatus" AS ENUM ('SCHEDULED', 'DEPARTED_TAXIING', 'EN_ROUTE', 'LANDED_TAXIING', 'ARRIVED', 'CANCELED');

-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "diversionAirportId" TEXT,
ADD COLUMN     "flightRadarStatus" "FlightRadarStatus";

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_diversionAirportId_fkey" FOREIGN KEY ("diversionAirportId") REFERENCES "airport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
