-- Migration: Add Analytics and Reports
-- Description: Adds tables for tracking analytics and generating reports

-- Patient Visit History
CREATE TABLE IF NOT EXISTS patient_visits (
    visit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    patient_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(doctor_id) ON DELETE SET NULL,
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    wait_time INTERVAL, -- Actual wait time
    consultation_time INTERVAL, -- Time spent with doctor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Queue Analytics
CREATE TABLE IF NOT EXISTS queue_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_patients INTEGER DEFAULT 0,
    avg_wait_time INTERVAL,
    avg_consultation_time INTERVAL,
    max_wait_time INTERVAL,
    no_shows INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Department Performance
CREATE TABLE IF NOT EXISTS department_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(department_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_appointments INTEGER DEFAULT 0,
    completed_appointments INTEGER DEFAULT 0,
    cancelled_appointments INTEGER DEFAULT 0,
    avg_patient_satisfaction DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patient Feedback
CREATE TABLE IF NOT EXISTS patient_feedback (
    feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    patient_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(doctor_id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Analytics
CREATE INDEX IF NOT EXISTS idx_patient_visits_date ON patient_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_queue_analytics_date ON queue_analytics(date);
CREATE INDEX IF NOT EXISTS idx_queue_analytics_doctor ON queue_analytics(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_department_analytics_date ON department_analytics(date);
CREATE INDEX IF NOT EXISTS idx_patient_feedback_doctor ON patient_feedback(doctor_id);

-- Function to update queue analytics
CREATE OR REPLACE FUNCTION update_queue_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert queue analytics for the day
    INSERT INTO queue_analytics (doctor_id, date)
    VALUES (NEW.doctor_id, CURRENT_DATE)
    ON CONFLICT (doctor_id, date) DO UPDATE
    SET 
        total_patients = queue_analytics.total_patients + 1,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics on new appointment
CREATE TRIGGER appointment_analytics_trigger
    AFTER INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_queue_analytics();