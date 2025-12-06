import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

export const helpers = {
  // Format date
  formatDate: (date, format = 'DD MMM YYYY') => {
    if (!date) return 'N/A';
    return dayjs(date).format(format);
  },

  // Format date with time
  formatDateTime: (date, format = 'DD MMM YYYY, hh:mm A') => {
    if (!date) return 'N/A';
    return dayjs(date).format(format);
  },

  // Format relative time
  formatRelativeTime: (date) => {
    if (!date) return 'N/A';
    return dayjs(date).fromNow();
  },

  // Format duration
  formatDuration: (minutes) => {
    if (!minutes) return '0m';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    
    return `${mins}m`;
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format currency
  formatCurrency: (amount, currency = 'NGN') => {
    if (amount === null || amount === undefined) return 'N/A';
    
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  },

  // Format number with commas
  formatNumber: (number) => {
    if (number === null || number === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(number);
  },

  // Calculate percentage
  calculatePercentage: (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  },

  // Generate random ID
  generateId: (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    
    for (let i = 0; i < length; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return id;
  },

  // Generate random color
  generateRandomColor: () => {
    const colors = [
      '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
      '#13c2c2', '#eb2f96', '#fa541c', '#2f54eb', '#a0d911',
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Deep clone object
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },

  // Merge objects
  mergeObjects: (target, source) => {
    const output = Object.assign({}, target);
    
    if (helpers.isObject(target) && helpers.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (helpers.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = helpers.mergeObjects(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  },

  // Check if value is object
  isObject: (item) => {
    return item && typeof item === 'object' && !Array.isArray(item);
  },

  // Remove null/undefined values from object
  removeEmptyValues: (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v != null)
    );
  },

  // Capitalize string
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Truncate text
  truncateText: (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    
    return text.substring(0, length) + '...';
  },

  // Generate slug from text
  generateSlug: (text) => {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  },

  // Validate URL
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Extract domain from URL
  extractDomain: (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  },

  // Get file extension
  getFileExtension: (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  },

  // Check if file is image
  isImageFile: (filename) => {
    const ext = helpers.getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  },

  // Check if file is document
  isDocumentFile: (filename) => {
    const ext = helpers.getFileExtension(filename);
    return ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);
  },

  // Check if file is video
  isVideoFile: (filename) => {
    const ext = helpers.getFileExtension(filename);
    return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext);
  },

  // Check if file is audio
  isAudioFile: (filename) => {
    const ext = helpers.getFileExtension(filename);
    return ['mp3', 'wav', 'ogg', 'm4a'].includes(ext);
  },

  // Create data URL from file
  createDataURL: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Download file
  downloadFile: (data, filename, type = 'text/plain') => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Copy to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  },

  // Get query parameters
  getQueryParams: () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    
    return result;
  },

  // Set query parameters
  setQueryParams: (params) => {
    const url = new URL(window.location);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    
    window.history.pushState({}, '', url.toString());
  },

  // Get cookie value
  getCookie: (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    
    return null;
  },

  // Set cookie
  setCookie: (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  // Remove cookie
  removeCookie: (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  },

  // Generate gradient colors
  generateGradient: (color1, color2, steps = 5) => {
    const colors = [];
    
    // Parse colors
    const parseColor = (color) => {
      const hex = color.replace('#', '');
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16),
      };
    };
    
    const start = parseColor(color1);
    const end = parseColor(color2);
    
    // Generate gradient steps
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      const r = Math.round(start.r + (end.r - start.r) * ratio);
      const g = Math.round(start.g + (end.g - start.g) * ratio);
      const b = Math.round(start.b + (end.b - start.b) * ratio);
      
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    
    return colors;
  },

  // Calculate reading time
  calculateReadingTime: (text, wordsPerMinute = 200) => {
    if (!text) return 0;
    
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  },

  // Generate progress percentage
  calculateProgress: (completed, total) => {
    if (!total) return 0;
    return Math.min(100, Math.round((completed / total) * 100));
  },

  // Format progress text
  formatProgress: (completed, total) => {
    const percentage = helpers.calculateProgress(completed, total);
    return `${completed}/${total} (${percentage}%)`;
  },

  // Get status color based on value
  getStatusColor: (value, thresholds = { good: 80, warning: 60 }) => {
    if (value >= thresholds.good) return '#52c41a';
    if (value >= thresholds.warning) return '#faad14';
    return '#f5222d';
  },

  // Get status text based on value
  getStatusText: (value, thresholds = { good: 80, warning: 60 }) => {
    if (value >= thresholds.good) return 'Good';
    if (value >= thresholds.warning) return 'Warning';
    return 'Critical';
  },

  // Sort array by property
  sortByProperty: (array, property, ascending = true) => {
    return [...array].sort((a, b) => {
      const aValue = a[property];
      const bValue = b[property];
      
      if (aValue < bValue) return ascending ? -1 : 1;
      if (aValue > bValue) return ascending ? 1 : -1;
      return 0;
    });
  },

  // Filter array by search term
  filterBySearch: (array, searchTerm, properties = []) => {
    if (!searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    
    return array.filter(item => {
      return properties.some(prop => {
        const value = item[prop];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        return false;
      });
    });
  },

  // Group array by property
  groupByProperty: (array, property) => {
    return array.reduce((groups, item) => {
      const key = item[property];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  },

  // Paginate array
  paginateArray: (array, page = 1, pageSize = 10) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: array.slice(start, end),
      page,
      pageSize,
      total: array.length,
      totalPages: Math.ceil(array.length / pageSize),
    };
  },

  // Generate pagination range
  generatePaginationRange: (currentPage, totalPages, delta = 2) => {
    const range = [];
    const rangeWithDots = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }
    
    let prev = 0;
    for (const i of range) {
      if (prev) {
        if (i - prev === 2) {
          rangeWithDots.push(prev + 1);
        } else if (i - prev !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      prev = i;
    }
    
    return rangeWithDots;
  },
};