import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faForward, 
  faRedo, 
  faClock,
  faTicket,
  faRefresh 
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const QueueManagement = ({ doctorId, onQueueUpdate }) => {
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/appointments/doctor/${doctorId}/current-token`);
      if (response.data.success) {
        setQueue(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    if (doctorId) {
      fetchQueue();
    }
  }, [doctorId, fetchQueue]);

  const advanceToken = async () => {
    try {
      setAdvancing(true);
      const response = await api.post(`/api/appointments/doctor/${doctorId}/advance-token`);
      if (response.data.success) {
        setQueue(response.data.data);
        if (onQueueUpdate) {
          onQueueUpdate(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error advancing token:', error);
      alert('Error advancing to next patient');
    } finally {
      setAdvancing(false);
    }
  };

  const resetQueue = async () => {
    if (!window.confirm('Are you sure you want to reset the queue? This will set the current token to 0.')) {
      return;
    }
    
    try {
      setResetting(true);
      const response = await api.post(`/api/appointments/doctor/${doctorId}/reset-token`);
      if (response.data.success) {
        fetchQueue();
        if (onQueueUpdate) {
          onQueueUpdate({ currentToken: 0 });
        }
      }
    } catch (error) {
      console.error('Error resetting queue:', error);
      alert('Error resetting queue');
    } finally {
      setResetting(false);
    }
  };

  if (!doctorId) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Select a doctor to view queue management
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading queue...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <FontAwesomeIcon icon={faTicket} className="mr-2" />
            Queue Management
          </h3>
          <button
            onClick={fetchQueue}
            className="text-white hover:text-blue-200 transition-colors"
            title="Refresh queue"
          >
            <FontAwesomeIcon icon={faRefresh} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Current Token Display */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-3">
            <span className="text-3xl font-bold text-blue-600">
              {queue?.currentToken || 0}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-700">Current Token</div>
          <div className="text-sm text-gray-500">
            {queue?.totalAppointments || 0} total appointments today
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={advanceToken}
            disabled={advancing || !queue?.totalAppointments}
            className="flex-1 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {advancing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FontAwesomeIcon icon={faForward} className="mr-2" />
            )}
            {advancing ? 'Advancing...' : 'Next Patient'}
          </button>
          
          <button
            onClick={resetQueue}
            disabled={resetting}
            className="text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center"
            title="Reset Queue"
          >
            {resetting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FontAwesomeIcon icon={faRedo} />
            )}
          </button>
        </div>

        {/* Queue List */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Upcoming Patients</h4>
          
          {!queue?.queue || queue.queue.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FontAwesomeIcon icon={faClock} className="text-3xl mb-2" />
              <p>No patients in queue</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {queue.queue.slice(0, 10).map((appointment, index) => (
                <div
                  key={appointment.appointment_id}
                  className="p-3 rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {appointment.token_number}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {appointment.patient_name}
                        </div>
                        {appointment.patient_phone && (
                          <div className="text-sm text-gray-600">
                            {appointment.patient_phone}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        {appointment.appointment_time?.slice(0, 5)}
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full">
                        {appointment.token_number === queue.currentToken + 1 ? 'Next' :
                         appointment.token_number <= queue.currentToken ? 'Done' : 'Waiting'}
                      </div>
                    </div>
                  </div>
                  
                  {appointment.reason && (
                    <div className="mt-2 text-sm text-gray-600">
                      {appointment.reason}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button className="py-2 px-4 border rounded-lg text-gray-700">Edit</button>
                    <button className="py-2 px-4 border rounded-lg text-gray-700">Reschedule</button>
                    <button className="py-2 px-4 border rounded-lg text-gray-700">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueManagement;