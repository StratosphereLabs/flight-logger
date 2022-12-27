-- CreateTable
CREATE TABLE "itinerary" (
    "id" UUID NOT NULL,
    "flights" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itinerary_pkey" PRIMARY KEY ("id")
);
