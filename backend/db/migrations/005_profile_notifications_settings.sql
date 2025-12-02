-- Migration for Profile, Notifications, and Settings modules
-- Updates users table and creates new tables

-- 1. Update users table to include profile fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS department VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Update password column name for consistency (only if it exists as 'password')
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN
        ALTER TABLE users RENAME COLUMN password TO password_hash;
    END IF;
END $$;

-- 2. Create activity_log table for user activity tracking
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'token', 'appointment'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'light', -- 'light', 'dark'
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  notify_email BOOLEAN DEFAULT true,
  notify_sms BOOLEAN DEFAULT true,
  notify_inapp BOOLEAN DEFAULT true,
  two_factor BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create user_devices table for security tracking
CREATE TABLE IF NOT EXISTS user_devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  device_name VARCHAR(255),
  device_type VARCHAR(100), -- 'desktop', 'mobile', 'tablet'
  ip_address INET,
  user_agent TEXT,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_active ON user_devices(is_active);

-- Create function for updated_at timestamps if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings for existing users
INSERT INTO user_settings (user_id)
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM user_settings);

-- Sample activity log entries
INSERT INTO activity_log (user_id, action, details) 
SELECT id, 'Account Created', '{"module": "auth"}' 
FROM users 
WHERE id NOT IN (SELECT DISTINCT user_id FROM activity_log WHERE action = 'Account Created');

-- Sample notifications
INSERT INTO notifications (user_id, title, message, type) 
SELECT 
  id, 
  'Welcome to HospEase!',
  'Your account has been successfully created. Explore the dashboard to get started.',
  'info'
FROM users;