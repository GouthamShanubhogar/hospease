import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AppointmentStats from '../components/appointments/AppointmentStats';
import QueueManagement from '../components/appointments/QueueManagement';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTimes, faCalendarAlt, faClock, faUser, faStethoscope, faTrash, faCalendarCheck, faExclamationTriangle, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const Appointments = () => {
  const location = useLocation();
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
  // Removed unused setShowStats and setShowQueue
  const [selectedDoctorForQueue, setSelectedDoctorForQueue] = useState('');
  const [reschedulingId, setReschedulingId] = useState(null);
  const [showRescheduleAlert, setShowRescheduleAlert] = useState(false);
  const [rescheduleToastId, setRescheduleToastId] = useState(null);
  const [rescheduleToastVisible, setRescheduleToastVisible] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const dateInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

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

  const filteredAppointments = appointments.filter(a =>
    (a.patient_name && a.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.doctor_name && a.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.reason && a.reason.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Card border color logic
  const getCardBorder = (status) => {
    if (status === 'confirmed') return 'border-green-500';
    if (status === 'cancelled') return 'border-red-500';
    if (status === 'booked') return 'border-yellow-500';
    return 'border-gray-300';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Alert Messages - Centered */}
        {(success || errors.submit) && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-xl transform transition-all duration-300 ${success ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'}`}>
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${success ? 'text-green-400' : 'text-red-400'}`}> <FontAwesomeIcon icon={success ? faCalendarCheck : faExclamationTriangle} className="w-6 h-6" /> </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${success ? 'text-green-800' : 'text-red-800'}`}>{success ? 'Success' : 'Error'}</h3>
                  <p className={`mt-1 text-sm ${success ? 'text-green-700' : 'text-red-700'}`}>{success || errors.submit}</p>
                </div>
                <button onClick={() => { setSuccess(''); setErrors({ ...errors, submit: '' }); }} className={`ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${success ? 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600' : 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600'}`}> <FontAwesomeIcon icon={faTimes} className="w-3 h-3" /> </button>
              </div>
            </div>
          </div>
        )}
        {/* Appointment Form */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h2 className="text-lg font-semibold">{editingId ? (reschedulingId ? 'Reschedule Appointment' : 'Edit Appointment') : 'Book New Appointment'}</h2>
            </div>
            <div className="p-6">
              {errors.submit && (<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{errors.submit}</div>)}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input ref={dateInputRef} type="date" className="w-full border px-3 py-2 rounded-lg" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                    {errors.date && <div className="text-xs text-red-600 mt-1">{errors.date}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <div className="flex gap-2">
                      <input type="number" min="1" max="12" className="w-16 border px-2 py-2 rounded-lg" placeholder="Hour" value={form.hour} onChange={e => setForm({ ...form, hour: e.target.value })} required />
                      <span className="self-center">:</span>
                      <input type="number" min="0" max="59" className="w-16 border px-2 py-2 rounded-lg" placeholder="Min" value={form.minute} onChange={e => setForm({ ...form, minute: e.target.value })} required />
                      <select className="border px-2 py-2 rounded-lg" value={form.ampm} onChange={e => setForm({ ...form, ampm: e.target.value })}>
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    {errors.time && <div className="text-xs text-red-600 mt-1">{errors.time}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                    <select className="w-full border px-3 py-2 rounded-lg" value={form.doctor_id} onChange={e => setForm({ ...form, doctor_id: e.target.value })} required>
                      <option value="">Select Doctor</option>
                      {doctors.map(doc => (
                        <option key={doc.doctor_id || doc.id} value={doc.doctor_id || doc.id}>{doc.name}</option>
                      ))}
                    </select>
                    {errors.doctor_id && <div className="text-xs text-red-600 mt-1">{errors.doctor_id}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                    <select className="w-full border px-3 py-2 rounded-lg" value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })} required>
                      <option value="">Select Patient</option>
                      {patients.map(pat => (
                        <option key={pat.patient_id || pat.id} value={pat.patient_id || pat.id}>{pat.name || pat.patient_name}</option>
                      ))}
                    </select>
                    {errors.patient_id && <div className="text-xs text-red-600 mt-1">{errors.patient_id}</div>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <input type="text" className="w-full border px-3 py-2 rounded-lg" placeholder="Reason for appointment" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
                  </div>
                </div>
                <div className="mt-6 flex gap-3 justify-end">
                  <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {editingId ? (reschedulingId ? 'Update Appointment' : 'Save Changes') : 'Book Appointment'}
                  </button>
                  {editingId && !reschedulingId && (
                    <button type="button" onClick={() => { setEditingId(null); setForm({ date: '', time: '', hour: '', minute: '', ampm: 'AM', doctor_id: '', patient_id: '', reason: '', status: 'booked' }); }} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Booked Appointments Title and Search Bar */}
        <div className="flex items-center justify-between mb-6 mt-8">
          <h2 className="text-xl font-bold text-black">Booked Appointments</h2>
          <input type="text" placeholder="Search appointments..." className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ minWidth: '220px' }} />
        </div>
        {/* Appointments List and Pagination wrapped in a parent div */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-500">No appointments scheduled yet. Book your first appointment!</div>
            ) : (
              filteredAppointments.slice((currentPage-1)*pageSize, currentPage*pageSize).map((apt) => (
                <div key={apt.appointment_id} id={`appointment-${apt.appointment_id}`} className={`bg-white border-2 rounded-xl p-6 shadow hover:shadow-md transition-all duration-300 ${getCardBorder(apt.status)} ${highlightedId === apt.appointment_id ? 'ring-4 ring-blue-300' : ''}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg text-gray-800">Token #{apt.token_number || apt.appointment_id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{apt.status}</span>
                  </div>
                  <div className="mb-1 text-sm text-gray-600"><FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />Patient: <span className="font-medium text-gray-900">{apt.patient_name}</span></div>
                  <div className="mb-1 text-sm text-gray-600"><FontAwesomeIcon icon={faStethoscope} className="mr-2 text-green-500" />Doctor: <span className="font-medium text-gray-900">{apt.doctor_name}</span></div>
                  <div className="mb-1 text-sm text-gray-600"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-500" />Date: <span className="font-medium text-gray-900">{formatDate(apt.appointment_date || apt.date)}</span></div>
                  <div className="mb-1 text-sm text-gray-600"><FontAwesomeIcon icon={faClock} className="mr-2 text-yellow-500" />Time: <span className="font-medium text-gray-900">{formatTime(apt.appointment_time || apt.preferred_time || apt.time)}</span></div>
                  <div className="mb-1 text-sm text-gray-600"><FontAwesomeIcon icon={faFileAlt} className="mr-2 text-gray-500" />Reason: <span className="font-medium text-gray-900">{apt.reason}</span></div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleEdit(apt)} className="px-3 py-1 border rounded-lg text-blue-700 font-medium hover:border-blue-500"><FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit</button>
                    <button onClick={() => handleReschedule(apt)} className="px-3 py-1 border rounded-lg text-purple-700 font-medium hover:border-purple-500"><FontAwesomeIcon icon={faCalendarCheck} className="mr-1" /> Reschedule</button>
                    <button onClick={() => handleCancel(apt.appointment_id)} className="px-3 py-1 border rounded-lg text-yellow-700 font-medium hover:border-yellow-500"><FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel</button>
                    <button onClick={() => handleDeleteClick(apt)} className="px-3 py-1 border rounded-lg text-red-700 font-medium hover:border-red-500"><FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-end items-center mt-4 gap-2">
            <button onClick={() => setCurrentPage(currentPage-1)} disabled={currentPage === 1} className="px-3 py-1 border rounded-lg text-gray-700 disabled:opacity-50">Prev</button>
            <span className="text-sm">Page {currentPage} of {Math.ceil(filteredAppointments.length/pageSize)}</span>
            <button onClick={() => setCurrentPage(currentPage+1)} disabled={currentPage === Math.ceil(filteredAppointments.length/pageSize)} className="px-3 py-1 border rounded-lg text-gray-700 disabled:opacity-50">Next</button>
          </div>
        </div>
        {/* Modals and Toasts - ensure all are inside the main parent div */}
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Appointment</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this appointment? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowDeleteModal(false); setAppointmentToDelete(null); }} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">Cancel</button>
                  <button onClick={handleDelete} disabled={loading} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">{loading ? 'Deleting...' : 'Delete'}</button>
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
              <button onClick={() => { viewAppointment(rescheduleToastId); setRescheduleToastVisible(false); }} className="underline font-medium text-white text-sm">View</button>
              <button onClick={() => setRescheduleToastVisible(false)} className="ml-2 text-white opacity-80" aria-label="close">×</button>
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
                  <p className="text-gray-600 mt-2">Update the <span className="font-medium">Date</span> and <span className="font-medium">Time</span> in the edit form on the right, then click <span className="font-medium">Update Appointment</span> to save the new schedule.</p>
                  <p className="text-sm text-gray-500 mt-2">You can also modify doctor, patient, and reason from the same form.</p>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => { setShowRescheduleAlert(false); setTimeout(() => dateInputRef.current?.focus(), 150); }} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Proceed to Edit</button>
                    <button onClick={() => { setShowRescheduleAlert(false); setReschedulingId(null); setEditingId(null); setForm({ date: '', time: '', hour: '', minute: '', ampm: 'AM', doctor_id: '', patient_id: '', reason: '', status: 'booked' }); }} className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
export default Appointments;
