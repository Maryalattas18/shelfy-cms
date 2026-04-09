-- =====================================================
-- Shelfy Screens — نظام المصادقة
-- شغّل هذا في: Supabase Dashboard > SQL Editor
-- =====================================================

ALTER TABLE clients ADD COLUMN IF NOT EXISTS password_hash text;

-- تحقق
SELECT id, company_name, email, password_hash IS NOT NULL as has_password FROM clients;
