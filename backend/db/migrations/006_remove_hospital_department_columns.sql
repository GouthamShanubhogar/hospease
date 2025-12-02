-- Remove hospital_id and department_id columns from appointments table
-- Run this migration to update the database schema

ALTER TABLE appointments DROP COLUMN IF EXISTS hospital_id;
ALTER TABLE appointments DROP COLUMN IF EXISTS department_id;