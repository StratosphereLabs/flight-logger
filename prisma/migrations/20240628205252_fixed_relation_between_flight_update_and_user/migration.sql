-- AddForeignKey
ALTER TABLE "flight_update" ADD CONSTRAINT "flight_update_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
