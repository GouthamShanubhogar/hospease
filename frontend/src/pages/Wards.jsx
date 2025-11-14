import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const Wards = () => {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    patient: '', 
    wardType: '', 
    roomNumber: '',
    bedNumber: ''
  });

  useEffect(() => {
    let mounted = true;
    api.get('/api/wards')
      .then(res => {
        if (!mounted) return;
        setWards(res.data || [
          { id: 1, name: 'General Ward - 101', totalBeds: 20, occupied: 12, available: 8, type: 'General', status: 'Available' },
          { id: 2, name: 'ICU - 201', totalBeds: 10, occupied: 8, available: 2, type: 'ICU', status: 'Limited' },
          { id: 3, name: 'Deluxe - 301', totalBeds: 15, occupied: 7, available: 8, type: 'Deluxe', status: 'Available' },
          { id: 4, name: 'Pediatric - 102', totalBeds: 12, occupied: 5, available: 7, type: 'Pediatric', status: 'Available' },
        ]);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/wards/allocate', form);
      const res = await api.get('/api/wards');
      setWards(res.data || []);
      setShowModal(false);
      setForm({ patient: '', wardType: '', roomNumber: '', bedNumber: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Available': 'bg-green-100 text-green-800',
      'Limited': 'bg-yellow-100 text-yellow-800',
      'Full': 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getWardColor = (type) => {
    const colors = {
      'General': 'border-blue-500',
      'ICU': 'border-red-500',
      'Deluxe': 'border-purple-500',
      'Pediatric': 'border-green-500',
    };
    return colors[type] || 'border-gray-500';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ward Management</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span>➕</span> Allocate Bed
          </button>
        </div>

        {/* Wards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wards.map((ward) => (
            <div key={ward.id} className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${getWardColor(ward.type)}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{ward.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(ward.status)}`}>
                  {ward.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Beds:</span>
                  <span className="font-semibold text-gray-900">{ward.totalBeds}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Occupied:</span>
                  <span className="font-semibold text-gray-900">{ward.occupied}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-semibold text-gray-900">{ward.available}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold text-gray-900">{ward.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allocate Bed Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Allocate Bed</h2>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ward Type</label>
                  <select
                    value={form.wardType}
                    onChange={(e) => setForm({ ...form, wardType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select ward type</option>
                    <option value="General">General</option>
                    <option value="ICU">ICU</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Pediatric">Pediatric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter room number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bed Number</label>
                  <input
                    type="text"
                    value={form.bedNumber}
                    onChange={(e) => setForm({ ...form, bedNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter bed number"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
                >
                  Allocate Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Wards;
