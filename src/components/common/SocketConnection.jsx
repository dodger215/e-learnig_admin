import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, Modal, Button, Typography, Alert, Progress } from 'antd';
import {
  WifiOutlined,
  WifiOffOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from './LoadingSpinner';

const { Text, Paragraph } = Typography;
const { confirm } = Modal;

const SocketConnection = ({ 
  showStatus = true, 
  autoReconnect = true,
  reconnectInterval = 5000,
  maxReconnectAttempts = 10,
  showNotifications = true,
  debug = false
}) => {
  const { socket } = useSocket();
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [latency, setLatency] = useState(null);
  const [lastPing, setLastPing] = useState(null);
  const [events, setEvents] = useState([]);
  const [packetLoss, setPacketLoss] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setConnectionStatus('connected');
      setReconnectAttempts(0);
      logEvent('Connected to server');
      if (showNotifications) {
        console.log('Socket connected successfully');
      }
      startLatencyTest();
    };

    const handleDisconnect = (reason) => {
      setConnectionStatus('disconnected');
      logEvent(`Disconnected: ${reason}`);
      
      if (showNotifications) {
        console.warn('Socket disconnected:', reason);
      }

      if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          socket.connect();
          logEvent(`Reconnecting... Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
        }, reconnectInterval);
      }
    };

    const handleConnectError = (error) => {
      setConnectionStatus('error');
      logEvent(`Connection error: ${error.message}`);
      
      if (showNotifications) {
        console.error('Socket connection error:', error);
      }
    };

    const handlePong = (latency) => {
      setLatency(latency);
      setLastPing(Date.now());
      logEvent(`Pong received: ${latency}ms`, 'debug');
    };

    // Event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('pong', handlePong);

    // Start initial connection
    if (!socket.connected) {
      socket.connect();
    }

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('pong', handlePong);
    };
  }, [socket, autoReconnect, reconnectInterval, maxReconnectAttempts, reconnectAttempts, showNotifications]);

  const startLatencyTest = () => {
    const interval = setInterval(() => {
      if (socket && socket.connected) {
        const start = Date.now();
        socket.emit('ping', start);
      }
    }, 10000);

    return () => clearInterval(interval);
  };

  const logEvent = (message, type = 'info') => {
    const newEvent = {
      timestamp: new Date().toISOString(),
      message,
      type,
    };

    setEvents(prev => {
      const updated = [newEvent, ...prev.slice(0, 49)]; // Keep last 50 events
      
      // Calculate packet loss (simplified)
      const totalEvents = updated.length;
      const errorEvents = updated.filter(e => e.type === 'error').length;
      const loss = totalEvents > 0 ? Math.round((errorEvents / totalEvents) * 100) : 0;
      setPacketLoss(loss);

      return updated;
    });
  };

  const handleManualReconnect = () => {
    if (socket) {
      setConnectionStatus('connecting');
      setReconnectAttempts(0);
      socket.connect();
      logEvent('Manual reconnection initiated');
    }
  };

  const handleShowDetails = () => {
    setShowDetails(true);
  };

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <WifiOutlined style={{ color: '#52c41a' }} />,
          color: '#52c41a',
          text: 'Connected',
          tooltip: `Latency: ${latency || '--'}ms`,
          badge: 'success'
        };
      case 'connecting':
        return {
          icon: <SyncOutlined spin style={{ color: '#faad14' }} />,
          color: '#faad14',
          text: 'Connecting...',
          tooltip: 'Establishing connection',
          badge: 'processing'
        };
      case 'disconnected':
        return {
          icon: <WifiOffOutlined style={{ color: '#ff4d4f' }} />,
          color: '#ff4d4f',
          text: 'Disconnected',
          tooltip: `Attempt ${reconnectAttempts}/${maxReconnectAttempts}`,
          badge: 'error'
        };
      case 'error':
        return {
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
          color: '#ff4d4f',
          text: 'Connection Error',
          tooltip: 'Click to retry',
          badge: 'error'
        };
      default:
        return {
          icon: <WifiOutlined style={{ color: '#d9d9d9' }} />,
          color: '#d9d9d9',
          text: 'Unknown',
          tooltip: 'Connection status unknown',
          badge: 'default'
        };
    }
  };

  const statusConfig = getStatusConfig();

  const renderConnectionDetails = () => (
    <Modal
      title="WebSocket Connection Details"
      open={showDetails}
      onCancel={() => setShowDetails(false)}
      footer={[
        <Button key="close" onClick={() => setShowDetails(false)}>
          Close
        </Button>,
        <Button 
          key="reconnect" 
          type="primary"
          onClick={handleManualReconnect}
          loading={connectionStatus === 'connecting'}
          disabled={connectionStatus === 'connected'}
        >
          Reconnect
        </Button>,
      ]}
      width={700}
    >
      <div style={{ marginBottom: 24 }}>
        <Alert
          message={`Status: ${statusConfig.text}`}
          type={connectionStatus === 'connected' ? 'success' : 
                connectionStatus === 'connecting' ? 'warning' : 'error'}
          showIcon
          action={
            <Button size="small" onClick={handleManualReconnect}>
              Reconnect
            </Button>
          }
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
          <Text type="secondary">Latency</Text>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: latency < 100 ? '#52c41a' : latency < 300 ? '#faad14' : '#ff4d4f' }}>
            {latency || '--'} ms
          </div>
        </div>
        <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
          <Text type="secondary">Reconnect Attempts</Text>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>
            {reconnectAttempts} / {maxReconnectAttempts}
          </div>
        </div>
        <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
          <Text type="secondary">Packet Loss</Text>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: packetLoss < 5 ? '#52c41a' : packetLoss < 20 ? '#faad14' : '#ff4d4f' }}>
            {packetLoss}%
          </div>
        </div>
        <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
          <Text type="secondary">Last Ping</Text>
          <div style={{ fontSize: 14 }}>
            {lastPing ? new Date(lastPing).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>Recent Events ({events.length})</Text>
        <Button 
          size="small" 
          style={{ marginLeft: 8 }}
          onClick={() => setEvents([])}
        >
          Clear
        </Button>
      </div>

      <div style={{ 
        maxHeight: 300, 
        overflow: 'auto', 
        background: '#fafafa',
        borderRadius: 6,
        padding: 12
      }}>
        {events.length === 0 ? (
          <Text type="secondary">No events recorded</Text>
        ) : (
          events.map((event, index) => (
            <div 
              key={index}
              style={{
                padding: '4px 8px',
                borderBottom: '1px solid #f0f0f0',
                fontSize: 12,
                fontFamily: 'monospace',
                color: event.type === 'error' ? '#ff4d4f' : 
                      event.type === 'debug' ? '#666' : '#333'
              }}
            >
              <span style={{ color: '#999', marginRight: 8 }}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
              {event.message}
            </div>
          ))
        )}
      </div>

      {debug && socket && (
        <div style={{ marginTop: 24 }}>
          <Text strong>Debug Information</Text>
          <pre style={{ 
            background: '#f6f8fa', 
            padding: 12, 
            borderRadius: 6,
            fontSize: 11,
            maxHeight: 200,
            overflow: 'auto',
            marginTop: 8
          }}>
            {JSON.stringify({
              id: socket.id,
              connected: socket.connected,
              disconnected: socket.disconnected,
              auth: socket.auth,
              listeners: socket._callbacks
            }, null, 2)}
          </pre>
        </div>
      )}
    </Modal>
  );

  if (!socket) {
    return (
      <Tooltip title="Socket not initialized">
        <Badge status="default" text="Offline" />
      </Tooltip>
    );
  }

  if (!showStatus) {
    return renderConnectionDetails();
  }

  return (
    <>
      <Tooltip title={statusConfig.tooltip}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            background: `${statusConfig.color}10`,
            border: `1px solid ${statusConfig.color}30`,
            borderRadius: 16,
            cursor: 'pointer',
            transition: 'all 0.3s',
            userSelect: 'none',
          }}
          onClick={handleShowDetails}
          onDoubleClick={handleManualReconnect}
        >
          {statusConfig.icon}
          <Text style={{ 
            fontSize: 12, 
            fontWeight: 500,
            color: statusConfig.color 
          }}>
            {statusConfig.text}
          </Text>
          {latency && connectionStatus === 'connected' && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {latency}ms
            </Text>
          )}
          {reconnectAttempts > 0 && connectionStatus !== 'connected' && (
            <Badge 
              count={reconnectAttempts} 
              size="small" 
              style={{ 
                backgroundColor: statusConfig.color 
              }} 
            />
          )}
        </div>
      </Tooltip>

      {showDetails && renderConnectionDetails()}

      {/* Connection quality indicator */}
      {connectionStatus === 'connected' && latency && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 12px',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12
        }}>
          <div style={{ width: 80 }}>
            <Progress 
              percent={Math.min(100, Math.max(0, 100 - packetLoss))}
              size="small"
              status={packetLoss > 20 ? 'exception' : packetLoss > 5 ? 'normal' : 'success'}
              showInfo={false}
            />
          </div>
          <Text type="secondary">Quality: {packetLoss > 20 ? 'Poor' : packetLoss > 5 ? 'Fair' : 'Good'}</Text>
        </div>
      )}
    </>
  );
};

SocketConnection.propTypes = {
  showStatus: PropTypes.bool,
  autoReconnect: PropTypes.bool,
  reconnectInterval: PropTypes.number,
  maxReconnectAttempts: PropTypes.number,
  showNotifications: PropTypes.bool,
  debug: PropTypes.bool,
};

SocketConnection.defaultProps = {
  showStatus: true,
  autoReconnect: true,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  showNotifications: true,
  debug: false,
};

export default SocketConnection;