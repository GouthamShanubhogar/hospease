-- Create patient_profiles table to store additional patient information
CREATE TABLE IF NOT EXISTS patient_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  blood_group VARCHAR(10),
  emergency_contact VARCHAR(20),
  emergency_contact_name VARCHAR(255),
  patient_type VARCHAR(50) DEFAULT 'Outpatient',
  insurance_provider VARCHAR(255),
  insurance_number VARCHAR(100),
  referring_doctor VARCHAR(255),
  medical_notes TEXT,
  estimated_cost DECIMAL(10,2) DEFAULT 0.00,
  payment_method VARCHAR(50) DEFAULT 'later',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at
CREATE TRIGGER update_patient_profiles_updated_at 
BEFORE UPDATE ON patient_profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();