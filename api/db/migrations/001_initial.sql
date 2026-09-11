CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'UPCOMING'
    CHECK (status IN ('UPCOMING', 'ACTIVE', 'CLOSED', 'ARCHIVED')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  image_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  moderated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS photos_period_status_idx ON photos (period_id, status);

CREATE TABLE IF NOT EXISTS photo_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (photo_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
