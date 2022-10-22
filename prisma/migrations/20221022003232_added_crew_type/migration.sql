/*
  Warnings:

  - The values [OTHER] on the enum `FlightReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FlightReason_new" AS ENUM ('LEISURE', 'BUSINESS', 'CREW');
ALTER TABLE "flight" ALTER COLUMN "reason" TYPE "FlightReason_new" USING ("reason"::text::"FlightReason_new");
ALTER TYPE "FlightReason" RENAME TO "FlightReason_old";
ALTER TYPE "FlightReason_new" RENAME TO "FlightReason";
DROP TYPE "FlightReason_old";
COMMIT;
