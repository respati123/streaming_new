CREATE TABLE IF NOT EXISTS "ai_interactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "chat_message_id" uuid NOT NULL UNIQUE REFERENCES "chat_messages"("id") ON DELETE CASCADE,
  "stream_id" uuid NOT NULL REFERENCES "stream_sessions"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "viewer_name" varchar(255) NOT NULL,
  "viewer_avatar_url" text,
  "prompt" text NOT NULL,
  "answer" text,
  "mood" varchar(32) NOT NULL DEFAULT 'neutral',
  "question_audio_key" varchar(255),
  "answer_audio_key" varchar(255),
  "status" varchar(32) NOT NULL DEFAULT 'queued',
  "attempts" integer NOT NULL DEFAULT 0,
  "error" text,
  "ready_at" timestamp with time zone,
  "playing_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_ai_interactions_status_created"
  ON "ai_interactions" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "idx_ai_interactions_user_created"
  ON "ai_interactions" ("user_id", "created_at");
