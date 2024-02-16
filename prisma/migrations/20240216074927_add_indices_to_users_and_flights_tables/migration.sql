-- CreateIndex
CREATE INDEX "flight_outTime_inTime_idx" ON "flight"("outTime", "inTime");

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");
