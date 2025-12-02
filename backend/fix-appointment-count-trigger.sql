-- Update the trigger to use new_patient_id instead of patient_id
DROP TRIGGER IF EXISTS appointment_count_trigger ON appointments;

-- Create updated function to use new_patient_id
CREATE OR REPLACE FUNCTION update_patient_appointment_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        UPDATE patients 
        SET total_appointments = total_appointments + 1 
        WHERE patient_id = COALESCE(NEW.new_patient_id, NEW.patient_id);
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        UPDATE patients 
        SET total_appointments = total_appointments - 1 
        WHERE patient_id = COALESCE(OLD.new_patient_id, OLD.patient_id);
        RETURN OLD;
    END IF;
    
    -- Handle UPDATE (if patient_id changes)
    IF TG_OP = 'UPDATE' THEN
        -- Get old and new patient IDs
        DECLARE
            old_pid INTEGER := COALESCE(OLD.new_patient_id, OLD.patient_id);
            new_pid INTEGER := COALESCE(NEW.new_patient_id, NEW.patient_id);
        BEGIN
            IF old_pid != new_pid THEN
                -- Decrease count for old patient
                UPDATE patients 
                SET total_appointments = total_appointments - 1 
                WHERE patient_id = old_pid;
                -- Increase count for new patient
                UPDATE patients 
                SET total_appointments = total_appointments + 1 
                WHERE patient_id = new_pid;
            END IF;
        END;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update appointment counts
CREATE TRIGGER appointment_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_patient_appointment_count();

-- Update existing patients with their current appointment counts using new_patient_id
UPDATE patients 
SET total_appointments = (
    SELECT COUNT(*) 
    FROM appointments 
    WHERE COALESCE(appointments.new_patient_id, appointments.patient_id) = patients.patient_id
);