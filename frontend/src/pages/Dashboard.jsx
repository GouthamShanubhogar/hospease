import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

// Dashboard page for HospEase
// Uses Tailwind CSS for styling. Fetches summary data from the backend.

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-white shadow-sm rounded-lg p-4 flex items-center space-x-4">
    <div className="p-3 rounded-md bg-blue-50 text-blue-600">{icon}</div>
    <div>
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
    </div>
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    patients: 0,
    doctors: 0,
    appointmentsToday: 0,
    revenueToday: 0,
  });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [sumRes, recentRes] = await Promise.all([
          axios.get(`${API_BASE}/api/dashboard/summary`),
          axios.get(`${API_BASE}/api/appointments?limit=8`),
        ]);

        if (!mounted) return;

        if (sumRes.data) {
          // Expecting { patients, doctors, appointmentsToday, revenueToday }
          setSummary(sumRes.data);
        }

        if (recentRes.data) {
          // If the API returns an array directly or an object with appointments
          const list = Array.isArray(recentRes.data) ? recentRes.data : (recentRes.data.appointments || []);
          setRecent(list);
        }
      } catch (err) {
        // If backend endpoints not ready, fall back to demo data
        if (!mounted) return;
        setSummary({ patients: 412, doctors: 27, appointmentsToday: 72, revenueToday: 2540 });
        setRecent([
          { id: 'a1', patient: 'John Doe', doctor: 'Dr. Smith', time: '09:00 AM', token: 12, status: 'booked' },
          { id: 'a2', patient: 'Jane Roe', doctor: 'Dr. Patel', time: '09:15 AM', token: 13, status: 'in_progress' },
          { id: 'a3', patient: 'Alan Smithee', doctor: 'Dr. Lin', time: '09:30 AM', token: 14, status: 'booked' },
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => (mounted = false);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: main dashboard content */}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Patients"
              value={summary.patients}
              subtitle="Total registered"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.6 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <StatCard
              title="Doctors"
              value={summary.doctors}
              subtitle="Available today"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.083 12.083 0 015.84 10.578L12 14z" /></svg>}
            />
            <StatCard
              title="Appointments"
              value={summary.appointmentsToday}
              subtitle="Today"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <StatCard
              title="Revenue"
              value={`$${summary.revenueToday}`}
              subtitle="Today"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4" /></svg>}
            />
          </div>

          {/* Recent appointments table */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Appointments</h2>
              <div className="text-sm text-gray-500">Updated: <span className="font-medium">{new Date().toLocaleTimeString()}</span></div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {recent.map((r) => (
                    <tr key={r.appointment_id || r.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{r.token || r.token_number || r.tokenNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{r.patient || r.patient_name || r.patientName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{r.doctor || r.doctor_name || r.doctorName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{r.time || r.preferred_time || r.appointment_date}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : r.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {r.status || 'booked'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <button className="text-blue-600 hover:text-blue-800">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: quick stats / wards */}
        <aside className="w-full lg:w-80">
          <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Wards Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">General</div>
                <div className="text-lg font-semibold">12 / 20</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">ICU</div>
                <div className="text-lg font-semibold">4 / 8</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Pediatrics</div>
                <div className="text-lg font-semibold">6 / 10</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Maternity</div>
                <div className="text-lg font-semibold">3 / 6</div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button className="py-2 px-3 bg-blue-600 text-white rounded">New Appointment</button>
              <button className="py-2 px-3 border border-gray-200 rounded">Add Patient</button>
              <button className="py-2 px-3 border border-gray-200 rounded">Add Doctor</button>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Billing Snapshot</h3>
            <div className="text-sm text-gray-700">Pending invoices: <span className="font-semibold">8</span></div>
            <div className="text-sm text-gray-700">Outstanding: <span className="font-semibold">$3,240</span></div>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default Dashboard;
