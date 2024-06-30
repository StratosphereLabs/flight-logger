-- AlterTable
ALTER TABLE "user" ADD COLUMN     "fcmToken" TEXT,
ADD COLUMN     "pushNotifications" BOOLEAN NOT NULL DEFAULT false;
