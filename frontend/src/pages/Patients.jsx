import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const Patients = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patientType: 'Outpatient',
    patientName: '',
    dateOfBirth: '',
    gender: '',
    contact: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyContactName: '',
    bloodGroup: '',
    admission: '',
    referring: '',
    insurance: '',
    insuranceProvider: '',
    insuranceNumber: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.contact.trim()) newErrors.contact = 'Contact is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await api.post('/api/patients', {
        name: form.patientName,
        email: form.email,
        phone: form.contact,
        date_of_birth: form.dateOfBirth,
        gender: form.gender,
        address: form.address,
        blood_group: form.bloodGroup,
        emergency_contact: form.emergencyContact,
        emergency_contact_name: form.emergencyContactName,
        patient_type: form.patientType,
        insurance_provider: form.insuranceProvider,
        insurance_number: form.insuranceNumber,
        referring_doctor: form.referring,
        notes: form.notes
      });

      if (response.data.success) {
        setSuccess('Patient registered successfully! Redirecting to appointments...');
        
        // Redirect to appointments page with patient data
        setTimeout(() => {
          navigate('/appointments', { 
            state: { 
              newPatient: response.data.data 
            } 
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Error registering patient:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Error registering patient. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 text-white p-4 rounded-t-lg flex items-center justify-between">
          <h1 className="text-lg font-semibold">Register new patient</h1>
          <button className="text-white hover:text-gray-300">✕</button>
        </div>

        <div className="bg-white border border-gray-300 rounded-b-lg p-6">
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}
          
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Patient Type Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                className={`px-4 py-2 rounded ${
                  form.patientType === 'Outpatient'
                    ? 'bg-gray-200 text-black'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setForm({ ...form, patientType: 'Outpatient' })}
              >
                Outpatient
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded ${
                  form.patientType === 'Inpatient'
                    ? 'bg-gray-200 text-black'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setForm({ ...form, patientType: 'Inpatient' })}
              >
                Inpatient
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded ${
                  form.patientType === 'Emergency'
                    ? 'bg-gray-200 text-black'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setForm({ ...form, patientType: 'Emergency' })}
              >
                Emergency
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Patient Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Patient details</h3>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Patient name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.patientName}
                    onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-400 ${
                      errors.patientName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.patientName && (
                    <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-400 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Date of birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-400 ${
                        errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    <FontAwesomeIcon 
                      icon={faCalendarAlt} 
                      className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={form.gender === 'Male'}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="mr-2"
                        required
                      />
                      <span className="text-sm text-gray-700">Male</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={form.gender === 'Female'}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="mr-2"
                        required
                      />
                      <span className="text-sm text-gray-700">Female</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Other"
                        checked={form.gender === 'Other'}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="mr-2"
                        required
                      />
                      <span className="text-sm text-gray-700">Other</span>
                    </label>
                  </div>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Contact <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-400 ${
                      errors.contact ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-xs mt-1">{errors.contact}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Blood Group</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={form.emergencyContactName}
                    onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    value={form.emergencyContact}
                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Referring Doctor</label>
                  <input
                    type="text"
                    value={form.referring}
                    onChange={(e) => setForm({ ...form, referring: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                    placeholder="Additional notes or medical history..."
                  />
                </div>
              </div>

              {/* Right Column - Insurance & Billing */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Insurance <span className="text-red-500">*</span>
                </h3>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Insurance Provider <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.insuranceProvider}
                    onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })}
                    placeholder="e.g., Blue Cross, Aetna, Medicare"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Insurance Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.insuranceNumber}
                    onChange={(e) => setForm({ ...form, insuranceNumber: e.target.value })}
                    placeholder="Policy/Member ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Insurance Information</p>
                  {form.insuranceProvider && form.insuranceNumber ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{form.insuranceProvider}</p>
                      <p className="text-xs text-gray-600">Policy: {form.insuranceNumber}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No insurance details provided</p>
                  )}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> Payment and billing details will be collected during patient discharge.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-sky-400 text-white rounded hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register Patient'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Patients;
