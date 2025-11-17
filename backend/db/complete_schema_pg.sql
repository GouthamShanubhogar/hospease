-- ============================================
-- HOSPEASE DATABASE SCHEMA
-- Complete SQL for all required tables (PostgreSQL)
-- ============================================

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. USERS TABLE (Authentication & User Management)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'patient', -- 'patient', 'doctor', 'staff', 'admin'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS hospitals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  total_beds INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. DOCTORS TABLE (Extended from existing)
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  qualification VARCHAR(255),
  experience INTEGER, -- years of experience
  current_token INTEGER DEFAULT 0,
  consultation_fee DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'on-leave', 'inactive'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. APPOINTMENTS TABLE (Extended)
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  token_number INTEGER,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled', 'no-show'
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL
);

-- 6. BEDS TABLE (For bed management)
CREATE TABLE IF NOT EXISTS beds (
  id SERIAL PRIMARY KEY,
  bed_number VARCHAR(50) NOT NULL,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  ward_type VARCHAR(100), -- 'General', 'ICU', 'Private', 'Semi-Private'
  status VARCHAR(50) DEFAULT 'available', -- 'available', 'occupied', 'maintenance', 'reserved'
  patient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. ADMISSIONS TABLE (For patient admissions tracking)
CREATE TABLE IF NOT EXISTS admissions (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  bed_id INTEGER REFERENCES beds(id) ON DELETE SET NULL,
  admission_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  discharge_date TIMESTAMP NULL,
  admission_type VARCHAR(50), -- 'emergency', 'planned', 'transfer'
  diagnosis TEXT,
  status VARCHAR(50) DEFAULT 'admitted', -- 'admitted', 'discharged', 'transferred'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. DISCHARGES TABLE (For discharge tracking)
CREATE TABLE IF NOT EXISTS discharges (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  admission_id INTEGER REFERENCES admissions(id) ON DELETE CASCADE,
  discharge_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  discharge_type VARCHAR(50), -- 'normal', 'against-medical-advice', 'transfer', 'deceased'
  discharge_summary TEXT,
  follow_up_date DATE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. PAYMENTS TABLE (For billing and revenue tracking)
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
  admission_id INTEGER REFERENCES admissions(id) ON DELETE SET NULL,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50), -- 'cash', 'card', 'upi', 'insurance', 'bank-transfer'
  payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(100),
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. LAB REPORTS TABLE
CREATE TABLE IF NOT EXISTS lab_reports (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
  test_name VARCHAR(255) NOT NULL,
  test_type VARCHAR(100),
  result TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  report_file_path TEXT,
  ordered_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  test_date TIMESTAMP,
  result_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. MEDICAL RECORDS TABLE
CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
  record_type VARCHAR(100), -- 'diagnosis', 'treatment', 'surgery', 'allergy', 'vaccination'
  title VARCHAR(255),
  description TEXT,
  record_date DATE,
  attachments TEXT, -- JSON array of file paths
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. STAFF SCHEDULES TABLE (For duty roster)
CREATE TABLE IF NOT EXISTS staff_schedules (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  shift_type VARCHAR(50), -- 'morning', 'afternoon', 'night', 'full-day'
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'absent', 'on-leave'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);

-- Admissions indexes
CREATE INDEX IF NOT EXISTS idx_admissions_patient ON admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_date ON admissions(admission_date);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_patient ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Beds indexes
CREATE INDEX IF NOT EXISTS idx_beds_status ON beds(status);
CREATE INDEX IF NOT EXISTS idx_beds_hospital ON beds(hospital_id);

-- Lab Reports indexes
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient ON lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_status ON lab_reports(status);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample hospital
INSERT INTO hospitals (name, address, city, state, total_beds) 
VALUES ('City General Hospital', '123 Main Street', 'Mumbai', 'Maharashtra', 150)
ON CONFLICT DO NOTHING;

-- Insert sample departments
INSERT INTO departments (name, hospital_id) 
VALUES 
  ('Cardiology', 1),
  ('Neurology', 1),
  ('Orthopedics', 1),
  ('Pediatrics', 1),
  ('Emergency', 1)
ON CONFLICT DO NOTHING;

-- Insert sample beds
INSERT INTO beds (bed_number, hospital_id, ward_type, status) 
VALUES 
  ('ICU-001', 1, 'ICU', 'available'),
  ('ICU-002', 1, 'ICU', 'occupied'),
  ('GEN-001', 1, 'General', 'available'),
  ('GEN-002', 1, 'General', 'available'),
  ('PVT-001', 1, 'Private', 'available')
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATE TRIGGERS FOR AUTO-UPDATING updated_at
-- ============================================

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for hospitals table
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for departments table
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for doctors table
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for appointments table
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for beds table
CREATE TRIGGER update_beds_updated_at BEFORE UPDATE ON beds
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for admissions table
CREATE TRIGGER update_admissions_updated_at BEFORE UPDATE ON admissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for payments table
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for prescriptions table
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for lab_reports table
CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON lab_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for discharges table
CREATE TRIGGER update_discharges_updated_at BEFORE UPDATE ON discharges
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
