ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "publicToken" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Booking_publicToken_key" ON "Booking"("publicToken");
