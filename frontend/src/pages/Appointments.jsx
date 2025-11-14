import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([
    { id: 1, doctorName: 'Dr. Emily Carter', patientName: 'John Smith', date: 'Oct 20, 2023', time: '10:00 AM' },
    { id: 2, doctorName: 'Dr. Michael Lee', patientName: 'Sarah Johnson', date: 'Oct 21, 2023', time: '1:00 PM' },
    { id: 3, doctorName: 'Dr. Sarah Brown', patientName: 'Mark Wilson', date: 'Oct 27, 2023', time: '3:00 PM' },
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    date: '', 
    time: '', 
    doctor: '', 
    patient: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add appointment logic
    setShowModal(false);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-black mb-6">Scheduled Appointments</h1>
        
        <div className="flex gap-6">
          {/* Appointments List */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">{apt.doctorName}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="text-black">Patient:</span> {apt.patientName}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="text-black">Date:</span> {apt.date}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="text-black">Time:</span> {apt.time}
                </p>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-sky-300 text-white py-2 px-4 rounded text-sm hover:bg-sky-400">
                    <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                  </button>
                  <button className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded text-sm hover:bg-gray-400">
                    <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Book New Appointment Form */}
          <div className="w-80 bg-white border border-blue-400 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Book New Appointment</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-blue-600 mb-2">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm text-blue-600 mb-2">Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm text-blue-600 mb-2">Doctor</label>
                <input
                  type="text"
                  value={form.doctor}
                  onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  placeholder="Select doctor"
                />
              </div>

              <div>
                <label className="block text-sm text-blue-600 mb-2">Patient</label>
                <input
                  type="text"
                  value={form.patient}
                  onChange={(e) => setForm({ ...form, patient: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  placeholder="Select patient"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-300 text-white py-2 px-4 rounded hover:bg-sky-400"
              >
                Book Appointment
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
