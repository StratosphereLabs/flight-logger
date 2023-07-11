/*
  Warnings:

  - You are about to drop the column `flights` on the `itinerary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "itinerary" DROP COLUMN "flights";

-- CreateTable
CREATE TABLE "itinerary_flight" (
    "id" UUID NOT NULL,
    "itineraryId" UUID NOT NULL,
    "departureAirportId" TEXT NOT NULL,
    "arrivalAirportId" TEXT NOT NULL,
    "airlineId" TEXT,
    "operatorAirlineId" TEXT,
    "flightNumber" INTEGER,
    "aircraftTypeId" TEXT,
    "outTime" TIMESTAMP(3) NOT NULL,
    "offTime" TIMESTAMP(3),
    "onTime" TIMESTAMP(3),
    "inTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "itinerary_flight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "itinerary_flight" ADD CONSTRAINT "itinerary_flight_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_flight" ADD CONSTRAINT "itinerary_flight_aircraftTypeId_fkey" FOREIGN KEY ("aircraftTypeId") REFERENCES "aircraft_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_flight" ADD CONSTRAINT "itinerary_flight_airlineId_fkey" FOREIGN KEY ("airlineId") REFERENCES "airline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_flight" ADD CONSTRAINT "itinerary_flight_arrivalAirportId_fkey" FOREIGN KEY ("arrivalAirportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_flight" ADD CONSTRAINT "itinerary_flight_departureAirportId_fkey" FOREIGN KEY ("departureAirportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_flight" ADD CONSTRAINT "itinerary_flight_operatorAirlineId_fkey" FOREIGN KEY ("operatorAirlineId") REFERENCES "airline"("id") ON DELETE SET NULL ON UPDATE CASCADE;
