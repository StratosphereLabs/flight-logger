-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "arrivalWeatherId" INTEGER,
ADD COLUMN     "departureWeatherId" INTEGER,
ADD COLUMN     "diversionWeatherId" INTEGER;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_departureWeatherId_fkey" FOREIGN KEY ("departureWeatherId") REFERENCES "weather_report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_arrivalWeatherId_fkey" FOREIGN KEY ("arrivalWeatherId") REFERENCES "weather_report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_diversionWeatherId_fkey" FOREIGN KEY ("diversionWeatherId") REFERENCES "weather_report"("id") ON DELETE SET NULL ON UPDATE CASCADE;
