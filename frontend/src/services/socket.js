import { io } from 'socket.io-client';
import { createContext, useContext, useEffect, useState } from 'react';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
let socket = null;

// Socket singleton to prevent multiple connections
export const getSocket = () => {
  if (!socket) {
    socket = io(baseURL, { 
      withCredentials: true,
      autoConnect: false, // Don't connect automatically
      transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
      upgrade: false, // Disable transport upgrade to prevent 400 errors
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return socket;
};

// Context for socket state and notifications
const SocketContext = createContext({
  isConnected: false,
  notifications: [],
  connect: () => {},
  disconnect: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socket = getSocket();
  // If a token and user are present, auto-connect and join the user room
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token) {
      // ensure socket connects and joins user's room
      socket.connect();
      if (user) {
        try {
          const parsed = JSON.parse(user);
          socket.once('connect', () => {
            socket.emit('join_room', `user_${parsed.user_id}`);
          });
        } catch (e) {
          // ignore parse errors
        }
      }
    }
  }
  useEffect(() => {
    const onConnect = () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    };

    const onTokenUpdated = ({ doctor_id, current_token }) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'token_update',
        doctorId: doctor_id,
        currentToken: current_token,
        timestamp: new Date(),
      }, ...prev]);
    };

    const onNewAppointment = (appointment) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'new_appointment',
        appointment,
        timestamp: new Date(),
      }, ...prev]);
    };

    const onAppointmentCreated = (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'appointment_created',
        message: data.message,
        appointment: data.appointment || data,
        timestamp: new Date(),
      }, ...prev]);
    };

    const onYourTurn = (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'your_turn',
        message: data.message,
        appointment: data.appointment,
        token: data.token,
        timestamp: new Date(),
        priority: 'high',
      }, ...prev]);
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('Your Turn!', {
          body: data.message,
          icon: '/logo192.png',
        });
      }
    };

    const onTurnApproaching = (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'turn_approaching',
        message: data.message,
        appointment: data.appointment,
        position: data.position,
        timestamp: new Date(),
        priority: 'medium',
      }, ...prev]);
    };

    const onAppointmentCompleted = (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'appointment_completed',
        message: data.message,
        appointment: data.appointment,
        timestamp: new Date(),
      }, ...prev]);
    };

    const onQueueUpdated = (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'queue_updated',
        doctorId: data.doctorId,
        currentToken: data.currentToken,
        date: data.date,
        timestamp: new Date(),
      }, ...prev]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('token_updated', onTokenUpdated);
    socket.on('new_appointment', onNewAppointment);
    socket.on('appointment_created', onAppointmentCreated);
    socket.on('your_turn', onYourTurn);
    socket.on('turn_approaching', onTurnApproaching);
    socket.on('appointment_completed', onAppointmentCompleted);
    socket.on('queue_updated', onQueueUpdated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('token_updated', onTokenUpdated);
      socket.off('new_appointment', onNewAppointment);
      socket.off('appointment_created', onAppointmentCreated);
      socket.off('your_turn', onYourTurn);
      socket.off('turn_approaching', onTurnApproaching);
      socket.off('appointment_completed', onAppointmentCompleted);
      socket.off('queue_updated', onQueueUpdated);
    };
  }, []);

  const connect = (userId) => {
    if (!isConnected) {
      socket.connect();
      if (userId) {
        // Ensure we join the user room once the socket is connected
        socket.once('connect', () => {
          socket.emit('join_room', `user_${userId}`);
        });
      }
    }
  };

  const disconnect = () => {
    if (isConnected) {
      socket.disconnect();
    }
  };

  const joinRoom = (room) => {
    // emit join_room; socket.io-client will buffer if not yet connected
    socket.emit('join_room', room);
  };

  const leaveRoom = (room) => {
    socket.emit('leave_room', room);
  };

  return (
    <SocketContext.Provider 
      value={{
        isConnected,
        notifications,
        connect,
        disconnect,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};