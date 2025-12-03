import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, 
  faCalendarXmark, 
  faClockRotateLeft, 
  faCheckCircle,
  faExclamationCircle,
  faChartLine 
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const AppointmentStats = ({ doctorId, dateRange }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [doctorId, dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (doctorId) params.append('doctor_id', doctorId);
      if (dateRange) params.append('date_range', dateRange);
      
      const response = await api.get(`/api/appointments/stats?${params}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <FontAwesomeIcon icon={faExclamationCircle} className="text-3xl mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Appointments',
      value: stats?.total_appointments || 0,
      icon: faCalendarCheck,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Completed',
      value: stats?.completed_count || 0,
      icon: faCheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Scheduled',
      value: stats?.scheduled_count || 0,
      icon: faClockRotateLeft,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Cancelled',
      value: stats?.cancelled_count || 0,
      icon: faCalendarXmark,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  const completionRate = stats?.total_appointments > 0 
    ? ((stats.completed_count / stats.total_appointments) * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FontAwesomeIcon icon={faChartLine} className="mr-2 text-blue-600" />
            Appointment Statistics
          </h3>
          {stats?.avg_consultation_time_minutes && (
            <div className="text-sm text-gray-600">
              Avg consultation: {Math.round(stats.avg_consultation_time_minutes)} min
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {statCards.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-lg p-4`}>
              <div className="flex items-center">
                <div className={`${stat.textColor} mr-3`}>
                  <FontAwesomeIcon icon={stat.icon} className="text-2xl" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {stats?.total_appointments > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-semibold text-green-600">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {stats?.no_show_count > 0 && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
              {stats.no_show_count} No-shows
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentStats;