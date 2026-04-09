-- =====================================================
-- Shelfy Screens — جدول الإشعارات
-- شغّل هذا في: Supabase Dashboard > SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type       text NOT NULL,   -- screen_online | screen_offline | campaign_ended | campaign_starting
  title      text NOT NULL,
  body       text,
  read       boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- تحقق
SELECT * FROM notifications LIMIT 5;
