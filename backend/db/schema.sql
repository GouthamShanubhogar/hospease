-- Minimal schema for HospEase (create these tables if they don't exist)

-- Users (if not already created by auth setup)
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  phone TEXT,
  role TEXT DEFAULT 'patient'
);

-- Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
  hospital_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Doctors
CREATE TABLE IF NOT EXISTS doctors (
  doctor_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  hospital_id INTEGER REFERENCES hospitals(hospital_id) ON DELETE SET NULL,
  specialty TEXT,
  current_token INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  appointment_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  doctor_id INTEGER REFERENCES doctors(doctor_id) ON DELETE SET NULL,
  hospital_id INTEGER REFERENCES hospitals(hospital_id) ON DELETE SET NULL,
  token_number INTEGER NOT NULL,
  appointment_date DATE NOT NULL,
  preferred_time TIMESTAMP NULL,
  status TEXT DEFAULT 'booked',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP NULL
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
