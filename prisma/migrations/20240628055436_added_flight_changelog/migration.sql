-- CreateEnum
CREATE TYPE "FlightChangeField" AS ENUM ('DEPARTURE_AIRPORT', 'ARRIVAL_AIRPORT', 'DIVERSION_AIRPORT', 'AIRLINE', 'OPERATOR_AIRLINE', 'FLIGHT_NUMBER', 'AIRCRAFT_TYPE', 'TAIL_NUMBER', 'CLASS', 'SEAT_NUMBER', 'SEAT_POSITION', 'REASON', 'COMMENTS', 'TRACKING_LINK', 'OUT_TIME', 'OFF_TIME', 'ON_TIME', 'IN_TIME', 'OUT_TIME_ACTUAL', 'OFF_TIME_ACTUAL', 'ON_TIME_ACTUAL', 'IN_TIME_ACTUAL', 'DEPARTURE_GATE', 'DEPARTURE_TERMINAL', 'ARRIVAL_BAGGAGE', 'ARRIVAL_GATE', 'ARRIVAL_TERMINAL');

-- CreateTable
CREATE TABLE "flight_update" (
    "id" UUID NOT NULL,
    "flightId" UUID NOT NULL,
    "changedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flight_update_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_update_change" (
    "id" UUID NOT NULL,
    "updateId" UUID NOT NULL,
    "field" "FlightChangeField" NOT NULL,
    "oldValue" TEXT,
    "oldDisplayValue" TEXT,
    "newValue" TEXT,
    "newDisplayValue" TEXT,

    CONSTRAINT "flight_update_change_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flight_update" ADD CONSTRAINT "flight_update_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_update_change" ADD CONSTRAINT "flight_update_change_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "flight_update"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
