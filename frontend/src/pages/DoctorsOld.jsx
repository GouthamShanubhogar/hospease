import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    specialization: '', 
    phone: '',
    email: '',
    status: 'online'
  });

  useEffect(() => {
    let mounted = true;
    api.get('/api/doctors')
      .then(res => {
        if (!mounted) return;
        setDoctors(res.data || [
          { id: 1, name: 'Dr. James Smith', specialization: 'Cardiologist', phone: '+1 234-567-8901', patients: 24, status: 'online' },
          { id: 2, name: 'Dr. Emily Williams', specialization: 'Neurologist', phone: '+1 234-567-8902', patients: 18, status: 'online' },
          { id: 3, name: 'Dr. Robert Davis', specialization: 'Orthopedic', phone: '+1 234-567-8903', patients: 31, status: 'offline' },
          { id: 4, name: 'Dr. Maria Martinez', specialization: 'Pediatrician', phone: '+1 234-567-8904', patients: 42, status: 'online' },
        ]);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/doctors', form);
      const res = await api.get('/api/doctors');
      setDoctors(res.data || []);
      setShowModal(false);
      setForm({ name: '', specialization: '', phone: '', email: '', status: 'online' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span>➕</span> Add Doctor
          </button>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl">
                  👨‍⚕️
                </div>
                <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                  doctor.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}></span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{doctor.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{doctor.specialization}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Patients:</span>
                  <span className="font-semibold text-gray-900">{doctor.patients || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold text-gray-900">{doctor.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Doctor</h2>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter doctor name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                  <input
                    type="text"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter specialization"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Doctors;
