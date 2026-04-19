-- ─── Pairing Requests (طلبات الربط التلقائي) ────────
CREATE TABLE IF NOT EXISTS pairing_requests (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  temp_code   text UNIQUE NOT NULL,
  pair_code   text,
  screen_id   uuid REFERENCES screens(id) ON DELETE SET NULL,
  status      text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE pairing_requests DISABLE ROW LEVEL SECURITY;

-- تنظيف الطلبات المنتهية تلقائياً (اختياري)
-- يمكن تشغيله كـ cron job في Supabase
-- DELETE FROM pairing_requests WHERE expires_at < now();
