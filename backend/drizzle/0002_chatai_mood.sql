ALTER TABLE "ai_interactions"
  ADD COLUMN IF NOT EXISTS "mood" varchar(32) NOT NULL DEFAULT 'neutral';
