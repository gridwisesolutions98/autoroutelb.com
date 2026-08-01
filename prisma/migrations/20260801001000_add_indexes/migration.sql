CREATE INDEX IF NOT EXISTS "User_role_approvalStatus_idx" ON "User"("role", "approvalStatus");
CREATE INDEX IF NOT EXISTS "Car_vendorId_idx" ON "Car"("vendorId");
CREATE INDEX IF NOT EXISTS "Car_category_idx" ON "Car"("category");
CREATE INDEX IF NOT EXISTS "Car_isApproved_isRented_idx" ON "Car"("isApproved", "isRented");
CREATE INDEX IF NOT EXISTS "Booking_carId_idx" ON "Booking"("carId");
CREATE INDEX IF NOT EXISTS "Booking_startDate_endDate_idx" ON "Booking"("startDate", "endDate");
