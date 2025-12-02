-- Add total_appointments column to patients table
ALTER TABLE patients ADD COLUMN total_appointments INTEGER DEFAULT 0;

-- Update existing patients with their current appointment counts
UPDATE patients 
SET total_appointments = (
    SELECT COUNT(*) 
    FROM appointments 
    WHERE appointments.patient_id = patients.patient_id
);

-- Create function to update appointment count
CREATE OR REPLACE FUNCTION update_patient_appointment_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        UPDATE patients 
        SET total_appointments = total_appointments + 1 
        WHERE patient_id = NEW.patient_id;
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        UPDATE patients 
        SET total_appointments = total_appointments - 1 
        WHERE patient_id = OLD.patient_id;
        RETURN OLD;
    END IF;
    
    -- Handle UPDATE (if patient_id changes)
    IF TG_OP = 'UPDATE' THEN
        IF OLD.patient_id != NEW.patient_id THEN
            -- Decrease count for old patient
            UPDATE patients 
            SET total_appointments = total_appointments - 1 
            WHERE patient_id = OLD.patient_id;
            -- Increase count for new patient
            UPDATE patients 
            SET total_appointments = total_appointments + 1 
            WHERE patient_id = NEW.patient_id;
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update appointment counts
DROP TRIGGER IF EXISTS appointment_count_trigger ON appointments;
CREATE TRIGGER appointment_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_patient_appointment_count();