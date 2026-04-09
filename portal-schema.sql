-- =====================================================
-- Shelfy Screens — إضافة بوابة العملاء
-- شغّل هذا في: Supabase Dashboard > SQL Editor
-- =====================================================

-- إضافة عمود portal_token لجدول العملاء
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_token uuid DEFAULT gen_random_uuid();

-- توليد token لكل عميل موجود ليس عنده token
UPDATE clients SET portal_token = gen_random_uuid() WHERE portal_token IS NULL;

-- إضافة عمود played_at لجدول play_logs (إن لم يكن موجوداً)
ALTER TABLE play_logs ADD COLUMN IF NOT EXISTS played_at timestamptz DEFAULT now();

-- تعطيل RLS
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE play_logs DISABLE ROW LEVEL SECURITY;

-- تحقق
SELECT id, company_name, portal_token FROM clients;
