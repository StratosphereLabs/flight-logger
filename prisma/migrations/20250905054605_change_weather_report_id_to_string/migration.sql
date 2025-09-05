/*
  Warnings:

  - The primary key for the `weather_report` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "flight" DROP CONSTRAINT "flight_arrivalWeatherId_fkey";

-- DropForeignKey
ALTER TABLE "flight" DROP CONSTRAINT "flight_departureWeatherId_fkey";

-- DropForeignKey
ALTER TABLE "flight" DROP CONSTRAINT "flight_diversionWeatherId_fkey";

-- AlterTable
ALTER TABLE "flight" ALTER COLUMN "arrivalWeatherId" SET DATA TYPE TEXT,
ALTER COLUMN "departureWeatherId" SET DATA TYPE TEXT,
ALTER COLUMN "diversionWeatherId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "weather_report" DROP CONSTRAINT "weather_report_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "weather_report_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_departureWeatherId_fkey" FOREIGN KEY ("departureWeatherId") REFERENCES "weather_report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_arrivalWeatherId_fkey" FOREIGN KEY ("arrivalWeatherId") REFERENCES "weather_report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_diversionWeatherId_fkey" FOREIGN KEY ("diversionWeatherId") REFERENCES "weather_report"("id") ON DELETE SET NULL ON UPDATE CASCADE;
