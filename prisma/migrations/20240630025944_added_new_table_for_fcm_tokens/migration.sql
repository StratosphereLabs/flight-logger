/*
  Warnings:

  - You are about to drop the column `fcmToken` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "fcmToken";

-- CreateTable
CREATE TABLE "fcm_token" (
    "id" UUID NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fcm_token_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fcm_token" ADD CONSTRAINT "fcm_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
