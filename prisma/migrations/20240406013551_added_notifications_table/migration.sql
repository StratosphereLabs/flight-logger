-- CreateEnum
CREATE TYPE "NotificationColor" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "NotificationAction" AS ENUM ('DISMISS');

-- CreateTable
CREATE TABLE "notification" (
    "id" UUID NOT NULL,
    "userId" INTEGER NOT NULL,
    "showDefault" BOOLEAN NOT NULL,
    "color" "NotificationColor",
    "title" TEXT NOT NULL,
    "description" TEXT,
    "expiration" TIMESTAMP(3),
    "primaryAction" "NotificationAction",
    "secondaryAction" "NotificationAction",

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
