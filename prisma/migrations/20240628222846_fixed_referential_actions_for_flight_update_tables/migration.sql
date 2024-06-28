/*
  Warnings:

  - You are about to drop the column `newDisplayValue` on the `flight_update_change` table. All the data in the column will be lost.
  - You are about to drop the column `oldDisplayValue` on the `flight_update_change` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "flight_update" DROP CONSTRAINT "flight_update_flightId_fkey";

-- DropForeignKey
ALTER TABLE "flight_update_change" DROP CONSTRAINT "flight_update_change_updateId_fkey";

-- AlterTable
ALTER TABLE "flight_update_change" DROP COLUMN "newDisplayValue",
DROP COLUMN "oldDisplayValue";

-- AddForeignKey
ALTER TABLE "flight_update" ADD CONSTRAINT "flight_update_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_update_change" ADD CONSTRAINT "flight_update_change_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "flight_update"("id") ON DELETE CASCADE ON UPDATE CASCADE;
