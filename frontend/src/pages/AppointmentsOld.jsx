import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    patient: '', 
    doctor: '', 
    date: '',
    time: '',
    department: ''
  });

  useEffect(() => {
    let mounted = true;
    api.get('/api/appointments')
      .then(res => {
        if (!mounted) return;
        setAppointments(res.data || [
          { id: 1, time: '09:00 AM', patient: 'John Doe', doctor: 'Dr. Smith', department: 'Cardiology', status: 'Completed' },
          { id: 2, time: '10:30 AM', patient: 'Sarah Johnson', doctor: 'Dr. Williams', department: 'Neurology', status: 'Confirmed' },
          { id: 3, time: '02:00 PM', patient: 'Michael Brown', doctor: 'Dr. Davis', department: 'Orthopedic', status: 'Pending' },
          { id: 4, time: '03:30 PM', patient: 'Emily Wilson', doctor: 'Dr. Martinez', department: 'Pediatrics', status: 'Confirmed' },
        ]);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/appointments', form);
      const res = await api.get('/api/appointments');
      setAppointments(res.data || []);
      setShowModal(false);
      setForm({ patient: '', doctor: '', date: '', time: '', department: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Completed': 'bg-blue-100 text-blue-800',
      'Confirmed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span>➕</span> Add Appointment
          </button>
        </div>

        {/* Calendar Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">December 2024</h3>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                ← Prev
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                Today
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{appointment.time}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{appointment.patient}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{appointment.doctor}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{appointment.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Schedule Appointment</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient</label>
                  <select
                    value={form.patient}
                    onChange={(e) => setForm({ ...form, patient: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select patient</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Sarah Johnson">Sarah Johnson</option>
                    <option value="Michael Brown">Michael Brown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor</label>
                  <select
                    value={form.doctor}
                    onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select doctor</option>
                    <option value="Dr. Smith">Dr. Smith</option>
                    <option value="Dr. Williams">Dr. Williams</option>
                    <option value="Dr. Davis">Dr. Davis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Appointments;
