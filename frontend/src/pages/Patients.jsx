import React, { useState } from 'react';
import Layout from '../components/Layout';

const Patients = () => {
  const [form, setForm] = useState({
    patientType: 'Outpat',
    patientName: '',
    dateOfBirth: '',
    gender: '',
    contact: '',
    admission: '',
    referring: '',
    insurance: '',
    notes: '',
    estimatedCost: '',
    billingAccount: '',
    payment: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', form);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 text-white p-4 rounded-t-lg flex items-center justify-between">
          <h1 className="text-lg font-semibold">Register new patient</h1>
          <button className="text-white hover:text-gray-300">✕</button>
        </div>

        <div className="bg-white border border-gray-300 rounded-b-lg p-6">
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
                  <label className="block text-sm text-gray-600 mb-1">Patient name</label>
                  <input
                    type="text"
                    value={form.patientName}
                    onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date of birth</label>
                  <input
                    type="text"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Gender</label>
                  <input
                    type="text"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Contact</label>
                  <input
                    type="text"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Admission</label>
                  <input
                    type="text"
                    value={form.admission}
                    onChange={(e) => setForm({ ...form, admission: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Referring</label>
                  <input
                    type="text"
                    value={form.referring}
                    onChange={(e) => setForm({ ...form, referring: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Insurance</label>
                  <input
                    type="text"
                    value={form.insurance}
                    onChange={(e) => setForm({ ...form, insurance: e.target.value })}
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
                  />
                </div>
              </div>

              {/* Right Column - Billing Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Insurance</h3>
                <div className="h-32 bg-gray-100 rounded mb-4"></div>

                <h3 className="text-sm font-semibold text-gray-700 mb-2">Billing information</h3>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Estimated cost</label>
                  <input
                    type="text"
                    value={form.estimatedCost}
                    onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Billing account</label>
                  <input
                    type="text"
                    value={form.billingAccount}
                    onChange={(e) => setForm({ ...form, billingAccount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <h3 className="text-sm font-semibold text-gray-700 mb-2 mt-6">Payment</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 bg-sky-300 text-white py-2 px-4 rounded hover:bg-sky-400"
                  >
                    Pay Now
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  >
                    Pay Later
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-sky-300 text-white rounded hover:bg-sky-400"
              >
                Register Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Patients;
