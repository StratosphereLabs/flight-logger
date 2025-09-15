-- DropForeignKey
ALTER TABLE "flight" DROP CONSTRAINT "flight_userId_fkey";

-- AlterTable
ALTER TABLE "flight" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
