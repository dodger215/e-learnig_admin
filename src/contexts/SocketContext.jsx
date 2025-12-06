import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { notification, message } from 'antd';
import { useAuth } from './AuthContext';

const SocketContext = createContext({});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const pingIntervalRef = useRef(null);

  useEffect(() => {
    if (user && user._id) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
        },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      setSocket(newSocket);

      // Connection events
      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected:', newSocket.id);
        
        // Start ping-pong for latency measurement
        pingIntervalRef.current = setInterval(() => {
          if (newSocket.connected) {
            const start = Date.now();
            newSocket.emit('ping', start);
          }
        }, 10000);
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log('Socket disconnected:', reason);
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Handle pong for latency
      newSocket.on('pong', (startTime) => {
        const latency = Date.now() - startTime;
        newSocket.emit('latency', { latency });
      });

      // Dashboard subscription
      if (user.role) {
        newSocket.emit('dashboard_subscribe', user.role);
      }

      // Personal room for notifications
      newSocket.emit('join_personal', user._id);

      // Handle real-time updates
      newSocket.on('dashboard_update', (data) => {
        const notification = {
          ...data,
          id: Date.now(),
          timestamp: new Date().toISOString(),
          read: false,
        };

        setNotifications(prev => [notification, ...prev]);

        notification.info({
          message: 'New Update',
          description: data.message,
          placement: 'topRight',
          duration: 4,
        });
      });

      // Handle earning updates
      newSocket.on('earning_update', (data) => {
        notification.success({
          message: 'New Earning',
          description: data.message,
          placement: 'topRight',
          duration: 4,
        });
      });

      // Handle chat messages
      newSocket.on('receive_message', (data) => {
        console.log('New message:', data);
      });

      // Handle user joined/left events
      newSocket.on('user_joined', (userId) => {
        console.log('User joined:', userId);
      });

      // Cleanup
      return () => {
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        newSocket.close();
      };
    }
  }, [user]);

  const sendMessage = (courseId, content) => {
    if (socket && socket.connected) {
      socket.emit('send_message', {
        courseId,
        content,
        senderId: user._id,
        senderName: user.name,
      });
    } else {
      message.error('Socket not connected');
    }
  };

  const joinCourseChat = (courseId) => {
    if (socket && socket.connected) {
      socket.emit('join_course', courseId);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const sendWebRTCOffer = (target, offer) => {
    if (socket && socket.connected) {
      socket.emit('offer', { target, offer });
    }
  };

  const sendWebRTCAnswer = (target, answer) => {
    if (socket && socket.connected) {
      socket.emit('answer', { target, answer });
    }
  };

  const sendICECandidate = (target, candidate) => {
    if (socket && socket.connected) {
      socket.emit('ice_candidate', { target, candidate });
    }
  };

  const joinMeeting = (meetingId) => {
    if (socket && socket.connected) {
      socket.emit('join_meeting', meetingId);
    }
  };

  const getConnectionStatus = () => {
    if (!socket) return 'disconnected';
    if (socket.connected) return 'connected';
    if (socket.disconnected) return 'disconnected';
    return 'connecting';
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        getConnectionStatus,
        sendMessage,
        joinCourseChat,
        sendWebRTCOffer,
        sendWebRTCAnswer,
        sendICECandidate,
        joinMeeting,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};