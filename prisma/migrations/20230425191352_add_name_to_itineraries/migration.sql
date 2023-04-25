/*
  Warnings:

  - Added the required column `name` to the `itinerary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "itinerary" ADD COLUMN     "name" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "itinerary" ADD CONSTRAINT "itinerary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
