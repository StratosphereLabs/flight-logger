/*
  Warnings:

  - The `offTime` column on the `flight` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `onTime` column on the `flight` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `outTime` on the `flight` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `inTime` on the `flight` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
DROP COLUMN "outTime",
ADD COLUMN     "outTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "offTime",
ADD COLUMN     "offTime" TIMESTAMP(3),
DROP COLUMN "onTime",
ADD COLUMN     "onTime" TIMESTAMP(3),
DROP COLUMN "inTime",
ADD COLUMN     "inTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "itinerary" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "trip" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
