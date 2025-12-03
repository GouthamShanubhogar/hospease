import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AppointmentStats from '../components/appointments/AppointmentStats';
import QueueManagement from '../components/appointments/QueueManagement';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTimes, faCalendarAlt, faClock, faUser, faStethoscope, faTrash, faCalendarCheck, faExclamationTriangle, faFileAlt, faChartBar, faList } from '@fortawesome/free-solid-svg-icons';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [selectedDoctorForQueue, setSelectedDoctorForQueue] = useState('');
  const [reschedulingId, setReschedulingId] = useState(null);
  const [showRescheduleAlert, setShowRescheduleAlert] = useState(false);
  const [rescheduleToastId, setRescheduleToastId] = useState(null);
  const [rescheduleToastVisible, setRescheduleToastVisible] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const dateInputRef = useRef(null);

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
        return;
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
    
    // Use mock data with token numbers when API fails or is empty
    setAppointments([
      { 
        id: 1, 
        appointment_id: 1, 
        token_number: 1,
        doctor_name: 'Dr. Emily Carter', 
        patient_name: 'Goutham S', 
        appointment_date: '2025-12-04', 
        appointment_time: '10:00',
        preferred_time: '10:00',
        status: 'confirmed',
        reason: 'General checkup',
        doctor_id: 1,
        patient_id: 2
      },
      { 
        id: 2, 
        appointment_id: 2, 
        token_number: 2,
        doctor_name: 'Dr. Michael Zhang', 
        patient_name: 'Darshan', 
        appointment_date: '2025-12-04', 
        appointment_time: '14:30',
        preferred_time: '14:30',
        status: 'confirmed',
        reason: 'Follow-up consultation',
        doctor_id: 2,
        patient_id: 3
      },
      { 
        id: 3, 
        appointment_id: 3, 
        token_number: 3,
        doctor_name: 'Dr. Sarah Lee', 
        patient_name: 'Nithya M N', 
        appointment_date: '2025-12-05', 
        appointment_time: '09:15',
        preferred_time: '09:15',
        status: 'booked',
        reason: 'Skin consultation',
        doctor_id: 3,
        patient_id: 4
      },
      { 
        id: 4, 
        appointment_id: 4, 
        token_number: 4,
        doctor_name: 'Dr. Emily Carter', 
        patient_name: 'Nandini K', 
        appointment_date: '2025-12-05', 
        appointment_time: '11:00',
        preferred_time: '11:00',
        status: 'booked',
        reason: 'Pediatric checkup',
        doctor_id: 1,
        patient_id: 5
      }
    ]);

  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(form.date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate < today) {
        newErrors.date = 'Appointment date cannot be in the past';
      }
    }

    if (!form.hour || !form.minute) {
      newErrors.time = 'Time is required';
    } else {
      const hour = parseInt(form.hour);
      const minute = parseInt(form.minute);
      if (isNaN(hour) || hour < 1 || hour > 12) newErrors.time = 'Hour must be between 1 and 12';
      else if (isNaN(minute) || minute < 0 || minute > 59) newErrors.time = 'Minute must be between 0 and 59';
      else {
        const hour24 = form.ampm === 'PM' && hour !== 12 ? hour + 12 : form.ampm === 'AM' && hour === 12 ? 0 : hour;
        if (hour24 < 9 || hour24 >= 18) newErrors.time = 'Appointments must be between 9:00 AM and 6:00 PM';
      }
    }

    if (!form.doctor_id) newErrors.doctor_id = 'Please select a doctor';
    if (!form.patient_id) newErrors.patient_id = 'Please select a patient';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertTo24Hour = (hour, minute, ampm) => {
    let hour24 = parseInt(hour);
    if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
    else if (ampm === 'AM' && hour24 === 12) hour24 = 0;
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const timeIn24Hour = convertTo24Hour(form.hour, form.minute, form.ampm);
      const appointmentData = {
        doctor_id: form.doctor_id,
        patient_id: form.patient_id,
        appointment_date: form.date,
        appointment_time: timeIn24Hour,
        reason: form.reason || 'General consultation',
        status: form.status
      };

      if (editingId) {
        if (reschedulingId) {
          const response = await api.post(`/api/appointments/${reschedulingId}/reschedule`, {
            new_date: appointmentData.appointment_date,
            new_time: appointmentData.appointment_time,
            reason: appointmentData.reason
          });
          if (response.data.success) {
            setSuccess('Appointment rescheduled successfully!');
            setRescheduleToastId(reschedulingId);
            setRescheduleToastVisible(true);
            setTimeout(() => setRescheduleToastVisible(false), 5000);
            setReschedulingId(null);
            setEditingId(null);
            setShowRescheduleAlert(false);
          }
        } else {
          const response = await api.put(`/api/appointments/${editingId}`, appointmentData);
          if (response.data.success) {
            setSuccess('Appointment updated successfully!');
            setEditingId(null);
          }
        }
      } else {
        const response = await api.post('/api/appointments', appointmentData);
        if (response.data.success) setSuccess('Appointment booked successfully!');
      }

      setForm({ date: '', time: '', hour: '', minute: '', ampm: 'AM', doctor_id: '', patient_id: '', reason: '', status: 'booked' });
      fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrors({ submit: error.response?.data?.message || 'Error booking appointment. Please try again.' });
    } finally {
      setLoading(false);
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
    
    // Always set mock data as fallback with your actual doctors
    setDoctors([
      { doctor_id: 1, id: 1, name: 'Dr. Emily Carter', specialization: 'Cardiology' },
      { doctor_id: 2, id: 2, name: 'Dr. Michael Zhang', specialization: 'Neurology' },
      { doctor_id: 3, id: 3, name: 'Dr. Sarah Lee', specialization: 'Dermatology' },
      { doctor_id: 11, id: 11, name: 'Dr. Alice Johnson', specialization: 'Neurology' },
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
    
    // Always set mock data as fallback with your actual patients
    setPatients([
      { patient_id: 2, id: 2, patient_name: 'Goutham S', name: 'Goutham S', email_address: 'gouthamgouthu173@gmail.com', email: 'gouthamgouthu173@gmail.com' },
      { patient_id: 3, id: 3, patient_name: 'Darshan', name: 'Darshan', email_address: 'darshan10@gmail.com', email: 'darshan10@gmail.com' },
      { patient_id: 4, id: 4, patient_name: 'Nithya M N', name: 'Nithya M N', email_address: 'nithya@gmail.com', email: 'nithya@gmail.com' },
      { patient_id: 5, id: 5, patient_name: 'Nandini K', name: 'Nandini K', email_address: 'nandini@gmail.com', email: 'nandini@gmail.com' },
    ]);
  };

  const handleEdit = (apt) => {
    setEditingId(apt.appointment_id);
    
    // Convert 24-hour time to 12-hour format
    let hour = 12;
    let minute = '00';
    let ampm = 'AM';
    
    if (apt.appointment_time || apt.preferred_time) {
      const timeString = apt.appointment_time || apt.preferred_time;
      const [hours, minutes] = timeString.split(':');
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
      setLoading(true);
      const response = await api.post(`/api/appointments/${aptId}/cancel`);
      
      if (response.data.success) {
        setSuccess('Appointment cancelled successfully!');
        fetchAppointments();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setErrors({ submit: 'Error cancelling appointment. Please try again.' });
      setTimeout(() => setErrors({}), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (appointment) => {
    if (appointment.status !== 'cancelled') {
      setErrors({ submit: 'Only cancelled appointments can be deleted.' });
      setTimeout(() => setErrors({}), 3000);
      return;
    }
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const handleReschedule = (apt) => {
    // Open the edit block with appointment pre-filled, and show a centered alert
    // explaining where to edit the fields. The actual reschedule will be
    // performed when the user submits the edit form.
    handleEdit(apt);
    setReschedulingId(apt.appointment_id);
    setShowRescheduleAlert(true);
  };

  // Auto-close the reschedule alert and focus the date input in the edit form
  useEffect(() => {
    if (!showRescheduleAlert) return;
    const t = setTimeout(() => {
      setShowRescheduleAlert(false);
      // focus the date input after a short delay to allow scroll
      setTimeout(() => dateInputRef.current?.focus(), 150);
    }, 800);
    return () => clearTimeout(t);
  }, [showRescheduleAlert]);

  const viewAppointment = (id) => {
    if (!id) return;
    const el = document.getElementById(`appointment-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    
    try {
      setLoading(true);
      const response = await api.delete(`/api/appointments/${appointmentToDelete.appointment_id || appointmentToDelete.id}`);
      
      if (response.data.success) {
        setSuccess('Appointment deleted successfully!');
        fetchAppointments();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setErrors({ submit: 'Error deleting appointment. Please try again.' });
      setTimeout(() => setErrors({}), 3000);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
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
          <div className="flex gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showStats 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faChartBar} className="mr-2" />
              Statistics
            </button>
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showQueue 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faList} className="mr-2" />
              Queue
            </button>
            <button
              onClick={() => navigate('/patients')}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Register New Patient
            </button>
          </div>
        </div>

        {/* Enhanced Alert Messages - Centered */}
        {(success || errors.submit) && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-xl transform transition-all duration-300 ${
              success ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'
            }`}>
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${
                  success ? 'text-green-400' : 'text-red-400'
                }`}>
                  <FontAwesomeIcon 
                    icon={success ? faCalendarCheck : faExclamationTriangle} 
                    className="w-6 h-6" 
                  />
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {success ? 'Success' : 'Error'}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {success || errors.submit}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSuccess('');
                    setErrors({ ...errors, submit: '' });
                  }}
                  className={`ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    success 
                      ? 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600' 
                      : 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600'
                  }`}
                >
                  <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vertical Appointment Form (top) */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Appointment' : 'Book New Appointment'}</h2>
            </div>

            <div className="p-6">
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{errors.submit}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date *</label>
                  <input
                    type="date"
                    ref={dateInputRef}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                </div>

                {/* Time Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Time *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={form.hour}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                          setForm({ ...form, hour: value });
                        }
                      }}
                      placeholder="Hour"
                      min="1"
                      max="12"
                      className={`p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.time ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
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
                        }
                      }}
                      placeholder="Min"
                      min="0"
                      max="59"
                      className={`p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.time ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
                    <select
                      value={form.ampm}
                      onChange={(e) => setForm({ ...form, ampm: e.target.value })}
                      className={`p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.time ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                </div>

                {/* Doctor Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor *</label>
                  <select
                    value={form.doctor_id}
                    onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.doctor_id ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctor_id || doctor.id} value={doctor.doctor_id || doctor.id}>{doctor.name} {doctor.specialization ? `- ${doctor.specialization}` : ''}</option>
                    ))}
                  </select>
                  {errors.doctor_id && <p className="text-red-500 text-sm mt-1">{errors.doctor_id}</p>}
                </div>

                {/* Patient Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient *</label>
                  <select
                    value={form.patient_id}
                    onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.patient_id ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.patient_id || patient.id} value={patient.patient_id || patient.id}>{patient.patient_name || patient.name} {patient.email_address || patient.email ? `(${patient.email_address || patient.email})` : ''}</option>
                    ))}
                  </select>
                  {errors.patient_id && <p className="text-red-500 text-sm mt-1">{errors.patient_id}</p>}
                </div>

                {/* Reason Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                  <textarea
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Describe the reason for this appointment"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 mt-6">
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setForm({ date: '', time: '', hour: '', minute: '', ampm: 'AM', doctor_id: '', patient_id: '', reason: '', status: 'booked' }); }} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
                  )}
                  <button type="submit" disabled={loading} className={`${editingId ? 'flex-1' : 'w-full'} bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}>
                    {loading && (<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>)}
                    {loading ? 'Processing...' : editingId ? 'Update Appointment' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Statistics Component */}
          {showStats && (
            <AppointmentStats />
          )}
          
          {/* Queue Management Component */}
          {showQueue && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Doctor for Queue
                  </label>
                  <select
                    value={selectedDoctorForQueue}
                    onChange={(e) => setSelectedDoctorForQueue(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctor_id || doctor.id} value={doctor.doctor_id || doctor.id}>
                        {doctor.name} {doctor.specialization ? `- ${doctor.specialization}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="lg:col-span-2">
                <QueueManagement 
                  doctorId={selectedDoctorForQueue}
                  onQueueUpdate={(data) => {
                    // Refresh appointments when queue is updated
                    fetchAppointments();
                  }}
                />
              </div>
            </div>
          )}
          {/* Appointments List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-500">
                No appointments scheduled yet. Book your first appointment!
              </div>
            ) : (
              appointments.map((apt) => (
                <div 
                  key={apt.appointment_id} 
                  id={`appointment-${apt.appointment_id}`}
                  className={`bg-white border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    apt.status === 'cancelled' ? 'border-red-200 opacity-75 bg-red-50' : 
                    apt.status === 'confirmed' ? 'border-green-200 bg-green-50' :
                    'border-blue-200 hover:border-blue-300'
                  } ${highlightedId === apt.appointment_id ? 'ring-4 ring-blue-300' : ''}`}
                >
                  {/* Header with Doctor and Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <FontAwesomeIcon icon={faStethoscope} className="text-blue-600 text-lg" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-blue-700 truncate">
                          {apt.doctor_name || 'Dr. Unknown'}
                        </h3>
                        {apt.token_number && (
                          <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full inline-block mt-1 font-medium">
                            Token #{apt.token_number}
                          </div>
                        )}
                      </div>
                    </div>
                    {apt.status && (
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide flex-shrink-0 ml-2 ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {apt.status}
                      </span>
                    )}
                  </div>
                  
                  {/* Patient Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faUser} className="mr-3 text-gray-400 w-4 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700">Patient</p>
                        <p className="font-semibold text-gray-900 truncate">{apt.patient_name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-blue-600 font-medium">Date</p>
                          <p className="text-sm font-bold text-blue-800 truncate">{formatDate(apt.appointment_date)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faClock} className="mr-2 text-purple-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-purple-600 font-medium">Time</p>
                          <p className="text-sm font-bold text-purple-800 truncate">{formatTime(apt.appointment_time || apt.preferred_time)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reason (if provided) */}
                  {apt.reason && apt.reason !== 'General consultation' && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-start">
                        <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-600 font-medium mb-1">Reason</p>
                          <p className="text-sm text-gray-800">{apt.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    {apt.status !== 'cancelled' ? (
                      <>
                        <button 
                          onClick={() => handleEdit(apt)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md"
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit
                        </button>
                        <button 
                          onClick={() => handleReschedule(apt)}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md"
                        >
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> Reschedule
                        </button>
                        <button 
                          onClick={() => handleCancel(apt.appointment_id)}
                          className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-gray-500 hover:to-gray-600 transition-all duration-200 shadow-md"
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-2" /> Cancel
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleDeleteClick(apt)}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Appointment</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this appointment? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setAppointmentToDelete(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Confirmation Toast */}
        {rescheduleToastVisible && rescheduleToastId && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <div className="text-sm">Appointment rescheduled</div>
              <button
                onClick={() => {
                  viewAppointment(rescheduleToastId);
                  setRescheduleToastVisible(false);
                }}
                className="underline font-medium text-white text-sm"
              >
                View
              </button>
              <button
                onClick={() => setRescheduleToastVisible(false)}
                className="ml-2 text-white opacity-80"
                aria-label="close"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Reschedule Instruction Modal */}
        {showRescheduleAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Reschedule Appointment</h3>
                  <p className="text-gray-600 mt-2">
                    Update the <span className="font-medium">Date</span> and <span className="font-medium">Time</span> in the edit form on the right,
                    then click <span className="font-medium">Update Appointment</span> to save the new schedule.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">You can also modify doctor, patient, and reason from the same form.</p>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowRescheduleAlert(false);
                        setTimeout(() => dateInputRef.current?.focus(), 150);
                      }}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Proceed to Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowRescheduleAlert(false);
                        setReschedulingId(null);
                        setEditingId(null);
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
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Appointments;
