-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "inTimeActual" TIMESTAMP(3),
ADD COLUMN     "offTimeActual" TIMESTAMP(3),
ADD COLUMN     "onTimeActual" TIMESTAMP(3),
ADD COLUMN     "outTimeActual" TIMESTAMP(3);
