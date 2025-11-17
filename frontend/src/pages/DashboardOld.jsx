import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. Johnson',
    age: 35,
    gender: 'Male',
    specialty: 'Cardiology',
    patients: 120,
    appointments: 5,
  });
  const [summary, setSummary] = useState({
    totalPatients: 120,
    staffMood: 'Optimistic',
    appointments: 45,
    occupiedBeds: 75,
    availableStaff: 25,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [sumRes] = await Promise.all([
          axios.get(`${API_BASE}/api/dashboard/summary`),
        ]);

        if (!mounted) return;

        if (sumRes.data) {
          setSummary({
            totalPatients: sumRes.data.patients || 120,
            staffMood: 'Optimistic',
            appointments: sumRes.data.appointmentsToday || 45,
            occupiedBeds: 75,
            availableStaff: 25,
          });
        }
      } catch (err) {
        if (!mounted) return;
        // Keep default values
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => (mounted = false);
  }, []);

  const currentDate = new Date();
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const day = currentDate.getDate();

  return (
    <Layout>
      <div className="flex h-screen bg-gray-50">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-6">Home / Dashboard</div>

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">Welcome, {doctorInfo.name}!</h1>
              </div>
              <p className="text-blue-50">
                Today is {dayName}, {monthName} {day}. You have {doctorInfo.appointments} appointments scheduled, 1 team meeting, and 2 follow-ups to manage. Let's make it a productive day!
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Total Patients</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{summary.totalPatients}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Staff Mood</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{summary.staffMood}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Appointments</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{summary.appointments}</p>
              </div>
            </div>

            {/* Next Appointment and Billing */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Next Appointment */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Appointment</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <div
                      key={num}
                      className={`flex-1 h-12 rounded-lg flex items-center justify-center font-semibold ${
                        num === 7
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ward Utilization */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ward Utilization</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      <span className="text-sm text-gray-600">Occupied Beds</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{summary.occupiedBeds}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                      <span className="text-sm text-gray-600">Available Staff</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{summary.availableStaff}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">Patient</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Ongoing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-600"></th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Expected</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Goal</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Remai</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-900">Total Revenue</td>
                    <td className="text-right py-3 text-sm text-gray-900">$50,00</td>
                    <td className="text-right py-3 text-sm text-gray-900">$60,000</td>
                    <td className="text-right py-3 text-sm text-gray-900">$10,0</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-900">Pending Payments</td>
                    <td className="text-right py-3 text-sm text-gray-900">30</td>
                    <td className="text-right py-3 text-sm text-gray-900">15</td>
                    <td className="text-right py-3 text-sm text-gray-900">5</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm text-gray-900">Expenses</td>
                    <td className="text-right py-3 text-sm text-gray-900">$20,00</td>
                    <td className="text-right py-3 text-sm text-gray-900">15,000</td>
                    <td className="text-right py-3 text-sm text-gray-900">15</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Profile & Upcoming */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          {/* Profile Card */}
          <div className="mb-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src="https://via.placeholder.com/150"
                alt="Dr. Alex Johnson"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Dr. Alex Johnson</h2>
            <p className="text-sm text-gray-500 mb-4">{doctorInfo.gender}, {doctorInfo.age} years old</p>

            {/* Mini Stats */}
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Specialt</p>
                <p className="font-semibold text-gray-900">{doctorInfo.specialty}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Patients</p>
                <p className="font-semibold text-gray-900">{doctorInfo.patients}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Appoint</p>
                <p className="font-semibold text-gray-900">{doctorInfo.appointments}</p>
              </div>
            </div>

            {/* Calendar Mini */}
            <div className="flex justify-center gap-2 mb-4">
              {[
                { day: 27, label: 'Mon' },
                { day: 28, label: 'Tue' },
                { day: 29, label: 'Wed' },
                { day: 30, label: 'Thu' },
                { day: 31, label: 'Fri' },
              ].map((date, idx) => (
                <div
                  key={idx}
                  className={`text-center ${
                    idx === 2 ? 'text-blue-500 font-semibold' : 'text-gray-400'
                  }`}
                >
                  <div className="text-xl">{date.day}</div>
                  <div className="text-xs">{date.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Team meeting</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Patient follow-up</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Health check reminder</span>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Edit profile
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
