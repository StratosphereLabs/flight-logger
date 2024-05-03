-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "addedByUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
