-- AlterTable
ALTER TABLE "user" ADD COLUMN     "passwordResetAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT;
