import { io } from 'socket.io-client';
import { notification, message } from 'antd';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.isConnected = false;
  }

  // Initialize socket connection
  initializeSocket = (token) => {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl ='http://localhost:5000';

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    this.setupEventListeners();
    return this.socket;
  };

  // Setup event listeners
  setupEventListeners = () => {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('socket_connected', { timestamp: Date.now() });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, need to manually reconnect
        setTimeout(() => {
          this.socket.connect();
        }, 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        notification.error({
          message: 'Connection Lost',
          description: 'Unable to establish real-time connection',
          duration: 0,
        });
      }
    });

    // Custom events
    this.socket.on('dashboard_update', (data) => {
      this.handleDashboardUpdate(data);
    });

    this.socket.on('earning_update', (data) => {
      this.handleEarningUpdate(data);
    });

    this.socket.on('notification', (data) => {
      this.handleNotification(data);
    });

    this.socket.on('chat_message', (data) => {
      this.handleChatMessage(data);
    });

    this.socket.on('assignment_submitted', (data) => {
      this.handleAssignmentSubmitted(data);
    });

    this.socket.on('meeting_scheduled', (data) => {
      this.handleMeetingScheduled(data);
    });

    this.socket.on('enrollment_created', (data) => {
      this.handleEnrollmentCreated(data);
    });

    // WebRTC signaling events
    this.socket.on('offer', (data) => {
      this.emitToListeners('webrtc_offer', data);
    });

    this.socket.on('answer', (data) => {
      this.emitToListeners('webrtc_answer', data);
    });

    this.socket.on('ice_candidate', (data) => {
      this.emitToListeners('webrtc_ice_candidate', data);
    });

    this.socket.on('user_joined', (data) => {
      this.emitToListeners('user_joined', data);
    });

    this.socket.on('user_left', (data) => {
      this.emitToListeners('user_left', data);
    });

    // Ping-pong for latency measurement
    this.socket.on('pong', (latency) => {
      this.emitToListeners('latency_update', latency);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emitToListeners('error', error);
    });
  };

  // Handle dashboard updates
  handleDashboardUpdate = (data) => {
    const { type, message: msg, data: updateData } = data;
    
    notification.info({
      message: `Dashboard Update: ${type.replace('_', ' ')}`,
      description: msg,
      placement: 'topRight',
      duration: 4,
    });

    this.emitToListeners('dashboard_update', data);
  };

  // Handle earning updates
  handleEarningUpdate = (data) => {
    notification.success({
      message: 'New Earning',
      description: data.message,
      placement: 'topRight',
      duration: 4,
    });

    this.emitToListeners('earning_update', data);
  };

  // Handle notifications
  handleNotification = (data) => {
    const { type, title, message: msg, priority } = data;

    const notificationType = priority === 'high' ? 'error' : 
                            priority === 'medium' ? 'warning' : 'info';

    notification[notificationType]({
      message: title,
      description: msg,
      placement: 'topRight',
      duration: priority === 'high' ? 0 : 4,
    });

    this.emitToListeners('notification_received', data);
  };

  // Handle chat messages
  handleChatMessage = (data) => {
    const { courseId, content, sender } = data;
    this.emitToListeners(`chat_${courseId}`, data);
  };

  // Handle assignment submissions
  handleAssignmentSubmitted = (data) => {
    const { assignment, student, course } = data;
    
    message.info(`New submission for assignment: ${assignment.title}`);
    
    this.emitToListeners('assignment_submission', data);
  };

  // Handle meeting schedules
  handleMeetingScheduled = (data) => {
    const { meeting, course } = data;
    
    notification.info({
      message: 'New Meeting Scheduled',
      description: `${meeting.title} for ${course.title}`,
      placement: 'topRight',
      duration: 4,
    });

    this.emitToListeners('meeting_scheduled', data);
  };

  // Handle enrollments
  handleEnrollmentCreated = (data) => {
    const { enrollment, student, course } = data;
    
    notification.success({
      message: 'New Enrollment',
      description: `${student.name} enrolled in ${course.title}`,
      placement: 'topRight',
      duration: 4,
    });

    this.emitToListeners('enrollment_created', data);
  };

  // Emit events
  emit = (event, data) => {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Socket not connected, cannot emit: ${event}`);
    }
  };

  // Join rooms
  joinRoom = (roomId) => {
    this.emit('join_room', { roomId });
  };

  leaveRoom = (roomId) => {
    this.emit('leave_room', { roomId });
  };

  // Join course chat
  joinCourseChat = (courseId) => {
    this.emit('join_course_chat', { courseId });
    this.joinRoom(`course_${courseId}`);
  };

  // Leave course chat
  leaveCourseChat = (courseId) => {
    this.emit('leave_course_chat', { courseId });
    this.leaveRoom(`course_${courseId}`);
  };

  // Send chat message
  sendChatMessage = (courseId, message) => {
    this.emit('send_chat_message', {
      courseId,
      message,
      timestamp: Date.now(),
    });
  };

  // Join meeting
  joinMeeting = (meetingId) => {
    this.emit('join_meeting', { meetingId });
    this.joinRoom(`meeting_${meetingId}`);
  };

  // Leave meeting
  leaveMeeting = (meetingId) => {
    this.emit('leave_meeting', { meetingId });
    this.leaveRoom(`meeting_${meetingId}`);
  };

  // WebRTC signaling
  sendWebRTCOffer = (target, offer) => {
    this.emit('webrtc_offer', { target, offer });
  };

  sendWebRTCAnswer = (target, answer) => {
    this.emit('webrtc_answer', { target, answer });
  };

  sendICECandidate = (target, candidate) => {
    this.emit('webrtc_ice_candidate', { target, candidate });
  };

  // Subscribe to dashboard updates
  subscribeToDashboard = (role) => {
    this.emit('subscribe_dashboard', { role });
    this.joinRoom(`dashboard_${role}`);
  };

  // Unsubscribe from dashboard updates
  unsubscribeFromDashboard = (role) => {
    this.emit('unsubscribe_dashboard', { role });
    this.leaveRoom(`dashboard_${role}`);
  };

  // Send ping for latency measurement
  sendPing = () => {
    if (this.socket && this.isConnected) {
      const startTime = Date.now();
      this.emit('ping', startTime);
    }
  };

  // Add event listener
  on = (event, callback) => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Also listen on socket
    if (this.socket) {
      this.socket.on(event, callback);
    }
  };

  // Remove event listener
  off = (event, callback) => {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  };

  // Emit to custom listeners
  emitToListeners = (event, data) => {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error);
        }
      });
    }
  };

  // Get connection status
  getConnectionStatus = () => {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.socket.disconnected) return 'disconnected';
    return 'connecting';
  };

  // Disconnect socket
  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  };

  // Reconnect socket
  reconnect = () => {
    if (this.socket) {
      this.socket.connect();
    }
  };

  // Get socket ID
  getSocketId = () => {
    return this.socket?.id;
  };

  // Check if connected
  isSocketConnected = () => {
    return this.socket?.connected || false;
  };

  // Get latency
  getLatency = () => {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve(null);
        return;
      }

      const startTime = Date.now();
      this.socket.emit('ping', startTime);
      
      const timeout = setTimeout(() => resolve(null), 5000);
      
      const pongHandler = (latency) => {
        clearTimeout(timeout);
        this.socket.off('pong', pongHandler);
        resolve(latency);
      };

      this.socket.on('pong', pongHandler);
    });
  };

  // Bulk operations
  bulkEmit = (events) => {
    if (this.socket && this.isConnected) {
      this.socket.emit('bulk', events);
    }
  };

  // Presence tracking
  updatePresence = (status, activity) => {
    this.emit('presence_update', {
      status,
      activity,
      timestamp: Date.now(),
    });
  };

  // Get online users in a room
  getRoomUsers = (roomId) => {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve([]);
        return;
      }

      this.socket.emit('get_room_users', roomId, (users) => {
        resolve(users || []);
      });
    });
  };
};

// Create singleton instance
const socketService = new SocketService();

export default socketService;