ALTER TABLE "donations"
  ADD COLUMN IF NOT EXISTS "payment_order_id" varchar(100),
  ADD COLUMN IF NOT EXISTS "payment_fee" numeric(12, 2),
  ADD COLUMN IF NOT EXISTS "payment_total" numeric(12, 2),
  ADD COLUMN IF NOT EXISTS "payment_number" text,
  ADD COLUMN IF NOT EXISTS "payment_expired_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "payment_completed_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "alert_template" varchar(32);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_donations_payment_order_id"
  ON "donations" ("payment_order_id")
  WHERE "payment_order_id" IS NOT NULL;
