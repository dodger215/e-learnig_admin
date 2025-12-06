import { useState, useEffect, useCallback } from 'react';

export const useCountdown = (targetDate, options = {}) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    const difference = new Date(targetDate) - new Date();
    
    if (difference <= 0) {
      setIsActive(false);
      setIsCompleted(true);
      return {};
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      totalSeconds: Math.floor(difference / 1000),
      totalMinutes: Math.floor(difference / (1000 * 60)),
      totalHours: Math.floor(difference / (1000 * 60 * 60)),
      totalDays: Math.floor(difference / (1000 * 60 * 60 * 24)),
    };
  }, [targetDate]);

  const formatTimeUnit = useCallback((unit) => {
    return unit < 10 ? `0${unit}` : unit.toString();
  }, []);

  const start = useCallback(() => {
    setIsActive(true);
    setIsCompleted(false);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback((newTargetDate = null) => {
    if (newTargetDate) {
      targetDate = newTargetDate;
    }
    setTimeLeft(calculateTimeLeft());
    setIsActive(false);
    setIsCompleted(false);
  }, [calculateTimeLeft]);

  useEffect(() => {
    if (!targetDate) return;

    const timeLeft = calculateTimeLeft();
    setTimeLeft(timeLeft);
    setIsActive(Object.keys(timeLeft).length > 0);

    if (Object.keys(timeLeft).length === 0) {
      setIsCompleted(true);
      if (options.onComplete) {
        options.onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  }, [targetDate, timeLeft, calculateTimeLeft, options]);

  const formattedTime = useCallback((format = 'standard') => {
    if (isCompleted) {
      return options.completedText || 'Completed';
    }

    const { days = 0, hours = 0, minutes = 0, seconds = 0 } = timeLeft;

    switch (format) {
      case 'compact':
        if (days > 0) return `${days}d ${formatTimeUnit(hours)}h`;
        if (hours > 0) return `${formatTimeUnit(hours)}h ${formatTimeUnit(minutes)}m`;
        return `${formatTimeUnit(minutes)}m ${formatTimeUnit(seconds)}s`;
      
      case 'short':
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m ${seconds}s`;
      
      case 'colon':
        if (days > 0) return `${days}:${formatTimeUnit(hours)}:${formatTimeUnit(minutes)}:${formatTimeUnit(seconds)}`;
        return `${formatTimeUnit(hours)}:${formatTimeUnit(minutes)}:${formatTimeUnit(seconds)}`;
      
      case 'standard':
      default:
        if (days > 0) return `${days} days, ${hours} hours`;
        if (hours > 0) return `${hours} hours, ${minutes} minutes`;
        return `${minutes} minutes, ${seconds} seconds`;
    }
  }, [timeLeft, isCompleted, options.completedText, formatTimeUnit]);

  return {
    timeLeft,
    isActive,
    isCompleted,
    formattedTime,
    start,
    stop,
    reset,
    formatTimeUnit,
    days: timeLeft.days || 0,
    hours: timeLeft.hours || 0,
    minutes: timeLeft.minutes || 0,
    seconds: timeLeft.seconds || 0,
  };
};