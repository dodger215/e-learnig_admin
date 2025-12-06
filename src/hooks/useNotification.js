import { notification } from 'antd';
import { useCallback } from 'react';

export const useNotification = () => {
  const showNotification = useCallback((type, message, description = '', duration = 4.5) => {
    const config = {
      message,
      description,
      duration,
      placement: 'topRight',
    };

    switch (type) {
      case 'success':
        notification.success(config);
        break;
      case 'error':
        notification.error(config);
        break;
      case 'warning':
        notification.warning(config);
        break;
      case 'info':
        notification.info(config);
        break;
      default:
        notification.open(config);
    }
  }, []);

  const success = useCallback((message, description = '', duration = 4.5) => {
    showNotification('success', message, description, duration);
  }, [showNotification]);

  const error = useCallback((message, description = '', duration = 4.5) => {
    showNotification('error', message, description, duration);
  }, [showNotification]);

  const warning = useCallback((message, description = '', duration = 4.5) => {
    showNotification('warning', message, description, duration);
  }, [showNotification]);

  const info = useCallback((message, description = '', duration = 4.5) => {
    showNotification('info', message, description, duration);
  }, [showNotification]);

  const destroyAll = useCallback(() => {
    notification.destroy();
  }, []);

  return {
    showNotification,
    success,
    error,
    warning,
    info,
    destroyAll,
  };
};