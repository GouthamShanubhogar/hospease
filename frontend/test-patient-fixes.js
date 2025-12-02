// Test script to verify patient management fixes
// Run this in browser console while on the patients page

console.log('=== Testing Patient Management Fixes ===');

// Test 1: Check if form inputs are properly controlled
console.log('1. Checking form initialization...');
const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], select, textarea');
let uncontrolledInputs = 0;
inputs.forEach(input => {
  if (input.value === undefined || input.value === null) {
    uncontrolledInputs++;
    console.log('Uncontrolled input found:', input.name || input.id);
  }
});
console.log(`Found ${uncontrolledInputs} uncontrolled inputs`);

// Test 2: Check patient data structure
console.log('2. Checking patient data structure...');
// This will be visible when viewing/editing patients

// Test 3: Check API endpoints
console.log('3. Testing API endpoints...');
fetch('/api/patients-new', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('API Response:', data);
  if (data.success && data.data && data.data.length > 0) {
    console.log('Sample patient data:', data.data[0]);
    
    // Check for common missing fields that caused N/A display
    const patient = data.data[0];
    console.log('Field analysis:');
    console.log('- Patient name:', patient.patient_name || 'MISSING');
    console.log('- Email:', patient.email_address || 'MISSING');
    console.log('- Phone:', patient.phone_number || 'MISSING');
    console.log('- DOB:', patient.date_of_birth || 'MISSING');
    console.log('- Gender:', patient.gender || 'MISSING');
    console.log('- Blood group:', patient.blood_group || 'MISSING');
    console.log('- Address:', patient.address || 'MISSING');
    console.log('- Emergency contact name:', patient.emergency_contact_name || 'MISSING');
    console.log('- Emergency contact phone:', patient.emergency_contact_phone || 'MISSING');
    console.log('- Patient type:', patient.patient_type || 'MISSING');
    console.log('- Additional notes:', patient.additional_notes || 'MISSING');
  }
})
.catch(error => {
  console.error('API Error:', error);
});

console.log('=== Test Complete ===');
console.log('Check the browser console for any React warnings about controlled/uncontrolled components');