-- CreateEnum
CREATE TYPE "PendingFlightStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "calendar_source" (
    "id" UUID NOT NULL,
    "userId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "calendar_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_flight" (
    "id" UUID NOT NULL,
    "calendarSourceId" UUID NOT NULL,
    "eventUid" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "parsedData" JSONB NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PendingFlightStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_flight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "calendar_source_url_key" ON "calendar_source"("url");

-- AddForeignKey
ALTER TABLE "calendar_source" ADD CONSTRAINT "calendar_source_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_flight" ADD CONSTRAINT "pending_flight_calendarSourceId_fkey" FOREIGN KEY ("calendarSourceId") REFERENCES "calendar_source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
