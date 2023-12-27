-- AlterTable
ALTER TABLE "airframe" ADD COLUMN     "aircraftTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "airframe" ADD CONSTRAINT "airframe_aircraftTypeId_fkey" FOREIGN KEY ("aircraftTypeId") REFERENCES "aircraft_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
