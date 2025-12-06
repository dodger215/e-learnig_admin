import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from './useNotification';
import { useLocalStorage } from './useLocalStorage';

export const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const socketRef = useRef(null);
  const { success, error } = useNotification();
  const { value: connectionHistory } = useLocalStorage('ws_connection_history', []);

  const {
    autoConnect = true,
    reconnect = true,
    reconnectAttempts: maxReconnectAttempts = 10,
    reconnectInterval = 3000,
    onOpen = null,
    onClose = null,
    onMessage = null,
    onError = null,
  } = options;

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = (event) => {
        setIsConnected(true);
        setReconnectAttempts(0);
        
        // Log connection
        const historyEntry = {
          timestamp: new Date().toISOString(),
          type: 'connect',
          url,
        };
        
        if (connectionHistory.length >= 50) {
          connectionHistory.shift();
        }
        connectionHistory.push(historyEntry);
        
        if (onOpen) onOpen(event);
        success('Connected to server');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          setMessages(prev => [...prev.slice(-99), data]); // Keep last 100 messages
          
          if (onMessage) onMessage(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        
        // Log disconnection
        const historyEntry = {
          timestamp: new Date().toISOString(),
          type: 'disconnect',
          code: event.code,
          reason: event.reason,
        };
        
        if (connectionHistory.length >= 50) {
          connectionHistory.shift();
        }
        connectionHistory.push(historyEntry);
        
        if (onClose) onClose(event);
        
        // Auto reconnect
        if (reconnect && reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        error('WebSocket connection error');
        if (onError) onError(event);
      };

      setSocket(ws);
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      error('Failed to create WebSocket connection');
    }
  }, [url, reconnect, maxReconnectAttempts, reconnectInterval, onOpen, onClose, onMessage, onError, success, error, connectionHistory]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((data) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      socketRef.current.send(message);
      return true;
    }
    
    error('WebSocket is not connected');
    return false;
  }, [error]);

  const sendPing = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  const connectionStatus = useCallback(() => {
    if (!socketRef.current) return 'disconnected';
    
    switch (socketRef.current.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    reconnectAttempts,
    connect,
    disconnect,
    sendMessage,
    sendPing,
    connectionStatus,
  };
};