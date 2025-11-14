import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    age: '', 
    gender: 'Male', 
    disease: '',
    doctor: '',
    status: 'Stable'
  });

  useEffect(() => {
    let mounted = true;
    api.get('/api/patients')
      .then(res => {
        if (!mounted) return;
        setPatients(res.data || [
          { id: 1, name: 'John Doe', age: 45, gender: 'Male', disease: 'Cardiac Arrest', doctor: 'Dr. Smith', status: 'Critical' },
          { id: 2, name: 'Sarah Johnson', age: 32, gender: 'Female', disease: 'Pneumonia', doctor: 'Dr. Williams', status: 'Stable' },
          { id: 3, name: 'Michael Brown', age: 58, gender: 'Male', disease: 'Diabetes', doctor: 'Dr. Davis', status: 'Stable' },
          { id: 4, name: 'Emily Wilson', age: 28, gender: 'Female', disease: 'Fracture', doctor: 'Dr. Martinez', status: 'Recovering' },
          { id: 5, name: 'David Lee', age: 65, gender: 'Male', disease: 'Hypertension', doctor: 'Dr. Smith', status: 'Stable' },
        ]);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/patients', form);
      const res = await api.get('/api/patients');
      setPatients(res.data || []);
      setShowModal(false);
      setForm({ name: '', age: '', gender: 'Male', disease: '', doctor: '', status: 'Stable' });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Critical': 'bg-red-100 text-red-800',
      'Stable': 'bg-green-100 text-green-800',
      'Recovering': 'bg-blue-100 text-blue-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span>➕</span> Add Patient
          </button>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Disease</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((patient, index) => (
                  <tr key={patient.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{patient.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.age}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.gender}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.disease}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.doctor}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(patient.status)}`}>
                        {patient.status}
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

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Patient</h2>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter patient name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter age"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Disease</label>
                  <input
                    type="text"
                    value={form.disease}
                    onChange={(e) => setForm({ ...form, disease: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter disease"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Doctor</label>
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
                    <option value="Dr. Martinez">Dr. Martinez</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
                >
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Patients;
