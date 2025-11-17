import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTimes, faCalendarAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const Appointments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({ 
    date: '', 
    time: '', 
    hour: '',
    minute: '',
    ampm: 'AM',
    doctor_id: '', 
    patient_id: '',
    reason: '',
    status: 'booked'
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Load appointments, doctors, and patients on mount
  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
    
    // Check if redirected from patient registration
    if (location.state?.newPatient) {
      const patient = location.state.newPatient;
      setForm(prev => ({ ...prev, patient_id: patient.user_id }));
      setSuccess(`Patient ${patient.name} registered! You can now book an appointment.`);
      setTimeout(() => setSuccess(''), 5000);
    }
  }, [location.state]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/api/appointments');
      if (response.data.success) {
        setAppointments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Use mock data if API fails
      setAppointments([
        { appointment_id: 1, doctor_name: 'Dr. Emily Carter', patient_name: 'John Smith', appointment_date: '2023-10-20', preferred_time: '10:00', status: 'confirmed' },
        { appointment_id: 2, doctor_name: 'Dr. Michael Lee', patient_name: 'Sarah Johnson', appointment_date: '2023-10-21', preferred_time: '13:00', status: 'confirmed' },
        { appointment_id: 3, doctor_name: 'Dr. Sarah Brown', patient_name: 'Mark Wilson', appointment_date: '2023-10-27', preferred_time: '15:00', status: 'confirmed' },
      ]);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/api/doctors');
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        setDoctors(response.data.data);
        return;
      }
    } catch (error) {
      console.log('API error, using mock doctors:', error.message);
    }
    
    // Always set mock data as fallback
    setDoctors([
      { user_id: '1', name: 'Dr. Emily Carter', specialization: 'Cardiology' },
      { user_id: '2', name: 'Dr. Michael Lee', specialization: 'Neurology' },
      { user_id: '3', name: 'Dr. Sarah Brown', specialization: 'Orthopedics' },
      { user_id: '4', name: 'Dr. James Wilson', specialization: 'Pediatrics' },
      { user_id: '5', name: 'Dr. Lisa Anderson', specialization: 'Dermatology' },
    ]);
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients');
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        setPatients(response.data.data);
        return;
      }
    } catch (error) {
      console.log('API error, using mock patients:', error.message);
    }
    
    // Always set mock data as fallback
    setPatients([
      { user_id: '1', name: 'John Smith', email: 'john@example.com' },
      { user_id: '2', name: 'Sarah Johnson', email: 'sarah@example.com' },
      { user_id: '3', name: 'Mark Wilson', email: 'mark@example.com' },
      { user_id: '4', name: 'Emily Davis', email: 'emily@example.com' },
      { user_id: '5', name: 'Robert Taylor', email: 'robert@example.com' },
    ]);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.date) newErrors.date = 'Date is required';
    
    if (!form.hour || !form.minute) {
      newErrors.time = 'Time is required';
    } else {
      const hour = parseInt(form.hour);
      const minute = parseInt(form.minute);
      
      if (isNaN(hour) || hour < 1 || hour > 12) {
        newErrors.time = 'Hour must be between 1 and 12';
      } else if (isNaN(minute) || minute < 0 || minute > 59) {
        newErrors.time = 'Minute must be between 0 and 59';
      }
    }
    
    if (!form.doctor_id) newErrors.doctor_id = 'Please select a doctor';
    if (!form.patient_id) newErrors.patient_id = 'Please select a patient';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertTo24Hour = (hour, minute, ampm) => {
    let hour24 = parseInt(hour);
    if (ampm === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
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
      const timeIn24Hour = convertTo24Hour(form.hour, form.minute, form.ampm);
      
      const appointmentData = {
        doctor_id: form.doctor_id,
        patient_id: form.patient_id,
        appointment_date: form.date,
        preferred_time: timeIn24Hour,
        reason: form.reason || 'General consultation',
        status: form.status
      };

      if (editingId) {
        // Update existing appointment
        const response = await api.put(`/api/appointments/${editingId}`, appointmentData);
        if (response.data.success) {
          setSuccess('Appointment updated successfully!');
          setEditingId(null);
        }
      } else {
        // Create new appointment
        const response = await api.post('/api/appointments', appointmentData);
        if (response.data.success) {
          setSuccess('Appointment booked successfully!');
        }
      }

      // Reset form
      setForm({
        date: '',
        time: '',
        hour: '',
        minute: '',
        ampm: 'AM',
        doctor_id: '',
        patient_id: '',
        reason: '',
        status: 'booked'
      });

      // Refresh appointments list
      fetchAppointments();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Error booking appointment. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (apt) => {
    setEditingId(apt.appointment_id);
    
    // Convert 24-hour time to 12-hour format
    let hour = 12;
    let minute = '00';
    let ampm = 'AM';
    
    if (apt.preferred_time) {
      const [hours, minutes] = apt.preferred_time.split(':');
      const hour24 = parseInt(hours);
      minute = minutes;
      
      if (hour24 === 0) {
        hour = 12;
        ampm = 'AM';
      } else if (hour24 < 12) {
        hour = hour24;
        ampm = 'AM';
      } else if (hour24 === 12) {
        hour = 12;
        ampm = 'PM';
      } else {
        hour = hour24 - 12;
        ampm = 'PM';
      }
    }
    
    setForm({
      date: apt.appointment_date || '',
      time: apt.preferred_time || '',
      hour: hour.toString(),
      minute: minute,
      ampm: ampm,
      doctor_id: apt.doctor_id || '',
      patient_id: apt.patient_id || '',
      reason: apt.reason || '',
      status: apt.status || 'booked'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = async (aptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await api.put(`/api/appointments/${aptId}`, { status: 'cancelled' });
      if (response.data.success) {
        setSuccess('Appointment cancelled successfully!');
        fetchAppointments();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Error cancelling appointment. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">Scheduled Appointments</h1>
          <button
            onClick={() => navigate('/patients')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Register New Patient
          </button>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <div className="flex gap-6">
          {/* Appointments List */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-500">
                No appointments scheduled yet. Book your first appointment!
              </div>
            ) : (
              appointments.map((apt) => (
                <div 
                  key={apt.appointment_id} 
                  className={`bg-white border rounded-lg p-6 ${
                    apt.status === 'cancelled' ? 'border-red-300 opacity-60' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-blue-600">
                      {apt.doctor_name || 'Dr. Unknown'}
                    </h3>
                    {apt.status && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium text-black">Patient:</span> {apt.patient_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                    <span className="font-medium text-black">Date:</span> 
                    <span className="ml-1">{formatDate(apt.appointment_date)}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-400" />
                    <span className="font-medium text-black">Time:</span> 
                    <span className="ml-1">{formatTime(apt.preferred_time)}</span>
                  </p>
                  
                  {apt.status !== 'cancelled' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(apt)}
                        className="flex-1 bg-sky-300 text-white py-2 px-4 rounded text-sm hover:bg-sky-400 transition"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                      </button>
                      <button 
                        onClick={() => handleCancel(apt.appointment_id)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded text-sm hover:bg-gray-400 transition"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Book New Appointment Form */}
          <div className="w-80 bg-white border border-blue-400 rounded-lg p-6 sticky top-4 h-fit">
            <h2 className="text-lg font-semibold text-black mb-4">
              {editingId ? 'Edit Appointment' : 'Book New Appointment'}
            </h2>
            
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-blue-600 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-400 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-blue-600 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.hour}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                        setForm({ ...form, hour: value });
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value && (parseInt(value) < 1 || parseInt(value) > 12)) {
                        setForm({ ...form, hour: '' });
                      }
                    }}
                    placeholder="Hour"
                    min="1"
                    max="12"
                    className={`flex-1 px-3 py-2 border rounded focus:outline-none focus:border-blue-400 ${
                      errors.time ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  <span className="flex items-center text-gray-500">:</span>
                  <input
                    type="number"
                    value={form.minute}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                        setForm({ ...form, minute: value });
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value !== '' && parseInt(value) >= 0 && parseInt(value) <= 59) {
                        setForm({ ...form, minute: value.padStart(2, '0') });
                      } else if (value && (parseInt(value) < 0 || parseInt(value) > 59)) {
                        setForm({ ...form, minute: '' });
                      }
                    }}
                    placeholder="Min"
                    min="0"
                    max="59"
                    className={`flex-1 px-3 py-2 border rounded focus:outline-none focus:border-blue-400 ${
                      errors.time ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  
                  <select
                    value={form.ampm}
                    onChange={(e) => setForm({ ...form, ampm: e.target.value })}
                    className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-400 ${
                      errors.time ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                {errors.time && (
                  <p className="text-red-500 text-xs mt-1">{errors.time}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-blue-600 mb-2">
                  Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.doctor_id}
                  onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-400 ${
                    errors.doctor_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.user_id} value={doctor.user_id}>
                      {doctor.name} {doctor.specialization ? `- ${doctor.specialization}` : ''}
                    </option>
                  ))}
                </select>
                {errors.doctor_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.doctor_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-blue-600 mb-2">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-400 ${
                    errors.patient_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient.user_id} value={patient.user_id}>
                      {patient.name} {patient.email ? `(${patient.email})` : ''}
                    </option>
                  ))}
                </select>
                {errors.patient_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.patient_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-blue-600 mb-2">Reason</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Reason for appointment (optional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        date: '',
                        time: '',
                        doctor_id: '',
                        patient_id: '',
                        reason: '',
                        status: 'booked'
                      });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`${editingId ? 'flex-1' : 'w-full'} bg-sky-400 text-white py-2 px-4 rounded hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Processing...' : editingId ? 'Update' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
