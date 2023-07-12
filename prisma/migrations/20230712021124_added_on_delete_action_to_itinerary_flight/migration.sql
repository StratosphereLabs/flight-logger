-- DropForeignKey
ALTER TABLE "itinerary_flight" DROP CONSTRAINT "itinerary_flight_itineraryId_fkey";

-- AddForeignKey
ALTER TABLE "itinerary_flight" ADD CONSTRAINT "itinerary_flight_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
