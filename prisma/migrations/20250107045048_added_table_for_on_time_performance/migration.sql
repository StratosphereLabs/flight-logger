-- CreateTable
CREATE TABLE "on_time_performance_rating" (
    "airlineId" TEXT NOT NULL,
    "flightNumber" INTEGER NOT NULL,
    "departureAirportId" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "onTime" INTEGER NOT NULL,
    "late" INTEGER NOT NULL,
    "veryLate" INTEGER NOT NULL,
    "excessive" INTEGER NOT NULL,
    "cancelled" INTEGER NOT NULL,
    "diverted" INTEGER NOT NULL,
    "totalObservations" INTEGER NOT NULL,
    "delayObservations" INTEGER NOT NULL,
    "mean" DOUBLE PRECISION NOT NULL,
    "standardDeviation" DOUBLE PRECISION NOT NULL,
    "min" INTEGER NOT NULL,
    "max" INTEGER NOT NULL,
    "onTimePercent" INTEGER NOT NULL,

    CONSTRAINT "on_time_performance_rating_pkey" PRIMARY KEY ("airlineId","flightNumber","departureAirportId","validFrom","validTo")
);
