-- Migration: Enhanced Doctor Profile Schema
-- This migration adds comprehensive doctor profile fields

-- Drop existing doctors table if it exists and recreate with new structure
DROP TABLE IF EXISTS doctors CASCADE;

-- Create enhanced doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  sub_specialty VARCHAR(255),
  experience_years INTEGER NOT NULL,
  location VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  availability_schedule VARCHAR(255),
  available_today BOOLEAN DEFAULT false,
  available_tomorrow BOOLEAN DEFAULT false,
  available_this_week BOOLEAN DEFAULT false,
  bio TEXT,
  education JSONB, -- Store education array as JSON
  certifications TEXT[], -- Array of certification strings
  languages TEXT[], -- Array of language strings
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  qualification VARCHAR(255),
  consultation_fee DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'on-leave', 'inactive'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_availability ON doctors(available_today, available_tomorrow, available_this_week);
CREATE INDEX IF NOT EXISTS idx_doctors_rating ON doctors(rating);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_doctors_updated_at ON doctors;
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO doctors (
  name, 
  specialty, 
  sub_specialty,
  experience_years, 
  location, 
  phone, 
  email, 
  availability_schedule,
  available_today,
  available_tomorrow,
  available_this_week,
  bio,
  education,
  certifications,
  languages,
  rating
) VALUES 
(
  'Dr. Emily Carter',
  'Cardiology',
  'Interventional Cardiology',
  8,
  'Building A, Room 201',
  '+1 (555) 123-4567',
  'emily.carter@hospease.com',
  'Mon-Fri',
  true,
  true,
  true,
  'Dr. Emily Carter is a board-certified cardiologist with extensive experience in interventional procedures.',
  '[{"degree": "MD", "institution": "Harvard Medical School", "year": "2016"}, {"degree": "Residency", "institution": "Johns Hopkins Hospital", "year": "2019"}]',
  ARRAY['Board Certified in Cardiology', 'Advanced Cardiac Life Support (ACLS)'],
  ARRAY['English', 'Spanish', 'French'],
  4.5
),
(
  'Dr. Michael Zhang',
  'Neurology',
  'Epilepsy & Seizure Disorders',
  12,
  'Building B, Room 305',
  '+1 (555) 234-5678',
  'michael.zhang@hospease.com',
  'Tue, Thu, Sat',
  false,
  true,
  true,
  'Dr. Michael Zhang is a leading neurologist specializing in epilepsy and seizure disorders.',
  '[{"degree": "MD", "institution": "Stanford University", "year": "2013"}, {"degree": "Fellowship", "institution": "Cleveland Clinic", "year": "2018"}]',
  ARRAY['Board Certified in Neurology', 'Epilepsy Monitoring Certification'],
  ARRAY['English', 'Mandarin', 'Cantonese'],
  5.0
),
(
  'Dr. Sarah Lee',
  'Dermatology',
  'Cosmetic Dermatology',
  6,
  'Building A, Room 150',
  '+1 (555) 345-6789',
  'sarah.lee@hospease.com',
  'Wed, Fri',
  true,
  false,
  true,
  'Dr. Sarah Lee specializes in both medical and cosmetic dermatology with a focus on skin health.',
  '[{"degree": "MD", "institution": "UCLA Medical School", "year": "2018"}, {"degree": "Residency", "institution": "UCSF", "year": "2021"}]',
  ARRAY['Board Certified in Dermatology', 'Cosmetic Dermatology Certificate'],
  ARRAY['English', 'Korean'],
  4.0
);