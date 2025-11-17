import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faCalendarCheck, faBed, faUserMd, 
  faChartLine, faDollarSign, faClipboardList, faArrowUp, faArrowDown
} from '@fortawesome/free-solid-svg-icons';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPatients: 245,
    todayAppointments: 18,
    availableBeds: 42,
    totalBeds: 150,
    activeStaff: 67,
    revenue: 125400,
    revenueGrowth: 12.5,
    admissions: 156,
    admissionsGrowth: 8.3
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const [sumRes, revRes, admRes, actRes, aptRes] = await Promise.all([
          axios.get(`${API_BASE}/api/dashboard/summary`, config).catch(() => ({ data: {} })),
          axios.get(`${API_BASE}/api/dashboard/revenue`, config).catch(() => ({ data: {} })),
          axios.get(`${API_BASE}/api/dashboard/admissions`, config).catch(() => ({ data: {} })),
          axios.get(`${API_BASE}/api/dashboard/activity`, config).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_BASE}/api/dashboard/appointments`, config).catch(() => ({ data: { data: [] } })),
        ]);

        if (!mounted) return;

        if (sumRes.data?.data) {
          setSummary(prev => ({
            ...prev,
            totalPatients: sumRes.data.data.totalPatients || prev.totalPatients,
            todayAppointments: sumRes.data.data.todayAppointments || prev.todayAppointments,
            availableBeds: sumRes.data.data.availableBeds || prev.availableBeds,
            totalBeds: sumRes.data.data.totalBeds || prev.totalBeds,
            activeStaff: sumRes.data.data.activeStaff || prev.activeStaff,
          }));
        }

        if (revRes.data?.data) {
          setSummary(prev => ({
            ...prev,
            revenue: revRes.data.data.revenue || prev.revenue,
            revenueGrowth: revRes.data.data.revenueGrowth || prev.revenueGrowth,
          }));
        }

        if (admRes.data?.data) {
          setSummary(prev => ({
            ...prev,
            admissions: admRes.data.data.admissions || prev.admissions,
            admissionsGrowth: admRes.data.data.admissionsGrowth || prev.admissionsGrowth,
          }));
        }

        if (actRes.data?.data) {
          setRecentActivity(actRes.data.data);
        }

        if (aptRes.data?.data) {
          setUpcomingAppointments(aptRes.data.data);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        if (!mounted) return;
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => (mounted = false);
  }, []);



  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Patients */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                +{summary.admissionsGrowth}%
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Patients</h3>
            <p className="text-3xl font-bold text-gray-900">{summary.totalPatients}</p>
            <p className="text-xs text-gray-500 mt-2">Active patients in system</p>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-purple-600 text-xl" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Today
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Appointments</h3>
            <p className="text-3xl font-bold text-gray-900">{summary.todayAppointments}</p>
            <p className="text-xs text-gray-500 mt-2">Scheduled for today</p>
          </div>

          {/* Available Beds */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faBed} className="text-green-600 text-xl" />
              </div>
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {summary.totalBeds} Total
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Available Beds</h3>
            <p className="text-3xl font-bold text-gray-900">{summary.availableBeds}</p>
            <p className="text-xs text-gray-500 mt-2">Beds ready for patients</p>
          </div>

          {/* Active Staff */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faUserMd} className="text-orange-600 text-xl" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                Active
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Staff on Duty</h3>
            <p className="text-3xl font-bold text-gray-900">{summary.activeStaff}</p>
            <p className="text-xs text-gray-500 mt-2">Medical staff available</p>
          </div>
        </div>

        {/* Revenue and Admissions Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Monthly Revenue</h3>
              <span className="text-2xl opacity-80">₹</span>
            </div>
            <p className="text-4xl font-bold mb-2">₹{(summary.revenue / 1000).toFixed(1)}K</p>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={summary.revenueGrowth >= 0 ? faArrowUp : faArrowDown} className={summary.revenueGrowth >= 0 ? "text-green-300" : "text-red-300"} />
              <span className="text-sm text-blue-100">{summary.revenueGrowth >= 0 ? '+' : ''}{summary.revenueGrowth}% from last month</span>
            </div>
          </div>

          {/* Admissions Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Admissions</h3>
              <FontAwesomeIcon icon={faClipboardList} className="text-2xl opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">{summary.admissions}</p>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={summary.admissionsGrowth >= 0 ? faArrowUp : faArrowDown} className={summary.admissionsGrowth >= 0 ? "text-green-300" : "text-red-300"} />
              <span className="text-sm text-purple-100">{summary.admissionsGrowth >= 0 ? '+' : ''}{summary.admissionsGrowth}% from last month</span>
            </div>
          </div>
        </div>

        {/* Recent Activity and Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent activity</p>
              ) : recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activity.type === 'admission' ? 'bg-green-100' :
                    activity.type === 'appointment' ? 'bg-blue-100' :
                    activity.type === 'discharge' ? 'bg-orange-100' : 'bg-purple-100'
                  }`}>
                    <FontAwesomeIcon icon={faClipboardList} className={
                      activity.type === 'admission' ? 'text-green-600' :
                      activity.type === 'appointment' ? 'text-blue-600' :
                      activity.type === 'discharge' ? 'text-orange-600' : 'text-purple-600'
                    } />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{activity.patient}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No upcoming appointments</p>
              ) : upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{apt.patient}</p>
                    <p className="text-xs text-gray-500 truncate">{apt.doctor} • {apt.department}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">{apt.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/appointments')}
              className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View All Appointments →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/patients')}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
            >
              <FontAwesomeIcon icon={faUsers} className="text-2xl text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Patient</p>
            </button>
            <button 
              onClick={() => navigate('/appointments')}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
            >
              <FontAwesomeIcon icon={faCalendarCheck} className="text-2xl text-purple-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Schedule</p>
            </button>
            <button 
              onClick={() => navigate('/doctors')}
              className="p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-center"
            >
              <FontAwesomeIcon icon={faUserMd} className="text-2xl text-green-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Doctor</p>
            </button>
            <button 
              onClick={() => navigate('/billing')}
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all text-center"
            >
              <FontAwesomeIcon icon={faChartLine} className="text-2xl text-orange-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Reports</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
