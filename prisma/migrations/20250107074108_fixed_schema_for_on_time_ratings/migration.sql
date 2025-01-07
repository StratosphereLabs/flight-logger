/*
  Warnings:

  - The primary key for the `on_time_performance_rating` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `arrivalAirportId` to the `on_time_performance_rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "on_time_performance_rating" DROP CONSTRAINT "on_time_performance_rating_pkey",
ADD COLUMN     "arrivalAirportId" TEXT NOT NULL,
ADD CONSTRAINT "on_time_performance_rating_pkey" PRIMARY KEY ("airlineId", "flightNumber", "departureAirportId", "arrivalAirportId", "validFrom");

-- AddForeignKey
ALTER TABLE "on_time_performance_rating" ADD CONSTRAINT "on_time_performance_rating_airlineId_fkey" FOREIGN KEY ("airlineId") REFERENCES "airline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "on_time_performance_rating" ADD CONSTRAINT "on_time_performance_rating_departureAirportId_fkey" FOREIGN KEY ("departureAirportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "on_time_performance_rating" ADD CONSTRAINT "on_time_performance_rating_arrivalAirportId_fkey" FOREIGN KEY ("arrivalAirportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
