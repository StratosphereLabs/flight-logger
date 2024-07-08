-- AlterTable
ALTER TABLE "flight_update" ADD COLUMN     "arrivalAirportId" TEXT,
ADD COLUMN     "departureAirportId" TEXT;

-- AddForeignKey
ALTER TABLE "flight_update" ADD CONSTRAINT "flight_update_departureAirportId_fkey" FOREIGN KEY ("departureAirportId") REFERENCES "airport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_update" ADD CONSTRAINT "flight_update_arrivalAirportId_fkey" FOREIGN KEY ("arrivalAirportId") REFERENCES "airport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
