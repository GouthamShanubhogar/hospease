-- Create a dedicated patients table separate from users
CREATE TABLE IF NOT EXISTS patients (
    patient_id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(5) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    additional_notes TEXT,
    patient_type VARCHAR(20) DEFAULT 'Outpatient' CHECK (patient_type IN ('Outpatient', 'Inpatient', 'Emergency')),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Discharged')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email_address);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone_number);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(patient_name);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_patients_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_timestamp
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_patients_timestamp();

-- Update appointments table to reference patients table instead of users
-- First, let's add a new column for patient reference
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS new_patient_id INTEGER REFERENCES patients(patient_id);

-- Create index for the new patient reference
CREATE INDEX IF NOT EXISTS idx_appointments_new_patient ON appointments(new_patient_id);

COMMIT;