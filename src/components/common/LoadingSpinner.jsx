import React from 'react';
import { Spin, Space, Typography } from 'antd';
import PropTypes from 'prop-types';

const { Text } = Typography;

const LoadingSpinner = ({ 
  size, 
  tip, 
  fullScreen, 
  overlay, 
  type,
  color,
  message,
  subMessage 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 'default';
      case 'large': return 'large';
      default: return 'large';
    }
  };

  const getColor = () => {
    return color || '#1890ff';
  };

  const spinner = (
    <Spin 
      size={getSize()} 
      tip={tip}
      style={{ color: getColor() }}
    />
  );

  const content = (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }}>
      {spinner}
      {message && (
        <Text style={{ 
          fontSize: 16, 
          fontWeight: 500,
          color: getColor(),
          marginTop: 8
        }}>
          {message}
        </Text>
      )}
      {subMessage && (
        <Text type="secondary" style={{ fontSize: 14 }}>
          {subMessage}
        </Text>
      )}
    </div>
  );

  // Full screen overlay loading
  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
        backdropFilter: 'blur(2px)'
      }}>
        {content}
      </div>
    );
  }

  // Overlay loading for containers
  if (overlay) {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.7)',
        zIndex: 100,
        borderRadius: type === 'card' ? 8 : 0
      }}>
        {content}
      </div>
    );
  }

  // Skeleton loading effect
  if (type === 'skeleton') {
    return (
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16
      }}>
        <div style={{
          width: '100%',
          height: 20,
          background: `linear-gradient(90deg, ${getColor()}10 25%, ${getColor()}20 50%, ${getColor()}10 75%)`,
          backgroundSize: '400% 100%',
          animation: 'loading 1.5s ease-in-out infinite',
          borderRadius: 4
        }} />
        <div style={{
          width: '80%',
          height: 20,
          background: `linear-gradient(90deg, ${getColor()}10 25%, ${getColor()}20 50%, ${getColor()}10 75%)`,
          backgroundSize: '400% 100%',
          animation: 'loading 1.5s ease-in-out infinite',
          borderRadius: 4
        }} />
        <div style={{
          width: '60%',
          height: 20,
          background: `linear-gradient(90deg, ${getColor()}10 25%, ${getColor()}20 50%, ${getColor()}10 75%)`,
          backgroundSize: '400% 100%',
          animation: 'loading 1.5s ease-in-out infinite',
          borderRadius: 4
        }} />
      </div>
    );
  }

  // Simple inline loading
  return content;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'default', 'large']),
  tip: PropTypes.string,
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool,
  type: PropTypes.oneOf(['spinner', 'skeleton']),
  color: PropTypes.string,
  message: PropTypes.string,
  subMessage: PropTypes.string,
};

LoadingSpinner.defaultProps = {
  size: 'large',
  type: 'spinner',
  color: '#1890ff',
  fullScreen: false,
  overlay: false,
};

// Add CSS for skeleton animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`, styleSheet.cssRules.length);

export default LoadingSpinner;