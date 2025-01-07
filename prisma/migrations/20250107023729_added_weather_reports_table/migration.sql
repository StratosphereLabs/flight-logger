-- CreateTable
CREATE TABLE "weather_report" (
    "id" INTEGER NOT NULL,
    "airportId" TEXT NOT NULL,
    "obsTime" TIMESTAMP(3) NOT NULL,
    "temp" DOUBLE PRECISION NOT NULL,
    "dewp" DOUBLE PRECISION NOT NULL,
    "wdir" INTEGER NOT NULL,
    "wspd" INTEGER NOT NULL,
    "wgst" INTEGER NOT NULL,
    "visib" TEXT NOT NULL,
    "altim" DOUBLE PRECISION NOT NULL,
    "wxString" TEXT,
    "vertVis" INTEGER,
    "rawOb" TEXT NOT NULL,
    "clouds" JSONB[],

    CONSTRAINT "weather_report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weather_report_airportId_obsTime_idx" ON "weather_report"("airportId", "obsTime");

-- AddForeignKey
ALTER TABLE "weather_report" ADD CONSTRAINT "weather_report_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
