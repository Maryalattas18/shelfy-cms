-- =====================================================
-- Shelfy Screens - Database Schema
-- شغّل هذا في: Supabase Dashboard > SQL Editor
-- =====================================================

-- تعطيل RLS مؤقتاً (سنفعّله لاحقاً مع Auth)
-- ملاحظة: الـ service key يتجاوز RLS تلقائياً

-- ─── Clients (العملاء) ───────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name  text NOT NULL,
  type          text NOT NULL DEFAULT 'brand' CHECK (type IN ('brand', 'minimarket')),
  email         text,
  phone         text,
  balance       numeric DEFAULT 0,
  status        text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- ─── Screens (الشاشات) ───────────────────────────────
CREATE TABLE IF NOT EXISTS screens (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text NOT NULL,
  location_name text,
  pair_code     text UNIQUE NOT NULL,
  orientation   text DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait')),
  device_type   text DEFAULT 'android_stick',
  status        text DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'idle')),
  last_seen     timestamptz,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE screens DISABLE ROW LEVEL SECURITY;

-- ─── Campaigns (الحملات) ─────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     uuid REFERENCES clients(id) ON DELETE CASCADE,
  name          text NOT NULL,
  status        text DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'paused', 'ended', 'scheduled')),
  start_date    date,
  end_date      date,
  price         numeric DEFAULT 0,
  priority      text DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  notes         text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- ─── Media (الوسائط) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     uuid REFERENCES clients(id) ON DELETE CASCADE,
  file_name     text NOT NULL,
  file_url      text NOT NULL,
  file_type     text NOT NULL CHECK (file_type IN ('image', 'video')),
  file_size_mb  numeric DEFAULT 0,
  duration_sec  integer DEFAULT 15,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE media DISABLE ROW LEVEL SECURITY;

-- ─── Campaign Media (ربط الحملات بالوسائط) ──────────
CREATE TABLE IF NOT EXISTS campaign_media (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id   uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  media_id      uuid REFERENCES media(id) ON DELETE CASCADE,
  order_num     integer DEFAULT 1,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(campaign_id, media_id)
);

ALTER TABLE campaign_media DISABLE ROW LEVEL SECURITY;

-- ─── Schedules (الجداول) ─────────────────────────────
CREATE TABLE IF NOT EXISTS schedules (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id   uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  screen_id     uuid REFERENCES screens(id) ON DELETE CASCADE,
  start_time    time NOT NULL,
  end_time      time NOT NULL,
  days_of_week  text[] DEFAULT ARRAY['sun','mon','tue','wed','thu'],
  duration_sec  integer DEFAULT 30,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;

-- ─── Play Logs (سجلات العرض) ─────────────────────────
CREATE TABLE IF NOT EXISTS play_logs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  screen_id     uuid REFERENCES screens(id) ON DELETE CASCADE,
  media_id      uuid REFERENCES media(id) ON DELETE CASCADE,
  played_at     timestamptz DEFAULT now(),
  duration      integer DEFAULT 0
);

ALTER TABLE play_logs DISABLE ROW LEVEL SECURITY;

-- ─── Storage Bucket ──────────────────────────────────
-- شغّل هذا في: Supabase Dashboard > Storage > New bucket
-- الاسم: shelfy-media
-- Public: true

-- ─── تحقق من الجداول ────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
