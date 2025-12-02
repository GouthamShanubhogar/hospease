// Test script to verify appointment creation
import fetch from 'node-fetch';

const testAppointment = async () => {
  try {
    // Test data
    const appointmentData = {
      patient_id: '12345678-90ab-cdef-1234-567890abcdef',
      doctor_id: '87654321-09ba-fedc-4321-0987654321ba', 
      appointment_date: '2025-11-26',
      preferred_time: '10:30:00',
      reason: 'Test appointment'
    };

    console.log('Testing appointment creation with:', appointmentData);

    const response = await fetch('http://localhost:5002/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(appointmentData)
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', result);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testAppointment();