-- =====================================================
-- Shelfy Screens - Schema Fixes
-- شغّل هذا في: Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. إضافة عمود location_name لجدول screens
ALTER TABLE screens ADD COLUMN IF NOT EXISTS location_name text;

-- 2. إضافة عمود created_at لجدول campaign_media (إذا لم يكن موجوداً)
ALTER TABLE campaign_media ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 3. تعطيل RLS على كل الجداول
ALTER TABLE clients        DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns      DISABLE ROW LEVEL SECURITY;
ALTER TABLE screens        DISABLE ROW LEVEL SECURITY;
ALTER TABLE media          DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedules      DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE play_logs      DISABLE ROW LEVEL SECURITY;

-- تحقق من الأعمدة الجديدة
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'screens' AND table_schema = 'public'
ORDER BY ordinal_position;
