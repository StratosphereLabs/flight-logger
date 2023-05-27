-- CreateTable
CREATE TABLE "manufacturer" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "manufacturer_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "airframe" (
    "icao24" TEXT NOT NULL,
    "registration" TEXT NOT NULL,
    "manufacturerCode" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "typeCode" TEXT NOT NULL,
    "serialNumber" TEXT,
    "lineNumber" TEXT,
    "icaoAircraftType" TEXT NOT NULL,
    "operatorId" TEXT,
    "owner" TEXT,
    "testReg" TEXT,
    "registrationDate" DATE,
    "registrationExprDate" DATE,
    "builtDate" DATE,
    "engines" TEXT,

    CONSTRAINT "airframe_pkey" PRIMARY KEY ("icao24")
);

-- AddForeignKey
ALTER TABLE "airframe" ADD CONSTRAINT "airframe_manufacturerCode_fkey" FOREIGN KEY ("manufacturerCode") REFERENCES "manufacturer"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airframe" ADD CONSTRAINT "airframe_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "airline"("id") ON DELETE SET NULL ON UPDATE CASCADE;
