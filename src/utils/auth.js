import jwt_decode from 'jwt-decode';

export const authUtils = {
  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Set token in localStorage
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // Remove token from localStorage
  removeToken: () => {
    localStorage.removeItem('token');
  },

  // Decode JWT token
  decodeToken: (token) => {
    try {
      return jwt_decode(token);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },

  // Get user from token
  getUserFromToken: (token) => {
    const decoded = authUtils.decodeToken(token);
    if (!decoded) return null;

    return {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'student',
      exp: decoded.exp,
      iat: decoded.iat,
    };
  },

  // Check if token is expired
  isTokenExpired: (token) => {
    const decoded = authUtils.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  },

  // Check if user has specific role
  hasRole: (user, requiredRole) => {
    if (!user || !user.role) return false;
    
    // Admin has all roles
    if (user.role === 'admin') return true;
    
    return user.role === requiredRole;
  },

  // Check if user has any of the required roles
  hasAnyRole: (user, requiredRoles) => {
    if (!user || !user.role) return false;
    
    if (user.role === 'admin') return true;
    
    return requiredRoles.includes(user.role);
  },

  // Check if user has all required roles
  hasAllRoles: (user, requiredRoles) => {
    if (!user || !user.role) return false;
    
    if (user.role === 'admin') return true;
    
    return requiredRoles.every(role => user.role === role);
  },

  // Get user permissions based on role
  getUserPermissions: (role) => {
    const permissions = {
      admin: [
        'view_dashboard',
        'manage_users',
        'manage_courses',
        'manage_tutors',
        'manage_students',
        'view_payments',
        'create_course',
        'delete_course',
        'edit_course',
        'assign_tutor',
        'view_analytics',
        'send_announcements',
        'manage_settings',
        'export_data',
        'manage_enrollments',
        'view_reports',
        'manage_content',
        'moderate_chat',
        'manage_meetings',
        'manage_assignments',
      ],
      tutor: [
        'view_dashboard',
        'manage_assignments',
        'grade_submissions',
        'schedule_meetings',
        'view_students',
        'view_courses',
        'create_assignment',
        'grade_assignment',
        'view_analytics',
        'send_messages',
        'manage_course_content',
        'view_reports',
        'join_meetings',
        'moderate_discussion',
      ],
      student: [
        'view_dashboard',
        'view_courses',
        'enroll_course',
        'submit_assignment',
        'view_grades',
        'join_meeting',
        'view_materials',
        'participate_chat',
        'view_progress',
        'download_materials',
        'view_certificates',
        'rate_courses',
        'ask_questions',
        'view_announcements',
      ],
    };

    return permissions[role] || [];
  },

  // Check if user has specific permission
  hasPermission: (user, permission) => {
    if (!user || !user.role) return false;
    
    if (user.role === 'admin') return true;
    
    const permissions = authUtils.getUserPermissions(user.role);
    return permissions.includes(permission);
  },

  // Check if user has any of the required permissions
  hasAnyPermission: (user, requiredPermissions) => {
    if (!user || !user.role) return false;
    
    if (user.role === 'admin') return true;
    
    const permissions = authUtils.getUserPermissions(user.role);
    return requiredPermissions.some(permission => 
      permissions.includes(permission)
    );
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  validatePasswordStrength: (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      score: Math.max(0, 100 - (errors.length * 20)), // Simple scoring
    };
  },

  // Generate random password
  generateRandomPassword: (length = 12) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
    password += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 26));
    password += '0123456789'.charAt(Math.floor(Math.random() * 10));
    password += '!@#$%^&*'.charAt(Math.floor(Math.random() * 8));
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  },

  // Format user name
  formatUserName: (user) => {
    if (!user) return 'Guest';
    
    if (user.name) {
      return user.name;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  },

  // Get user initials for avatar
  getUserInitials: (name) => {
    if (!name) return 'U';
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    return name.substring(0, 2).toUpperCase();
  },

  // Get user avatar color based on name
  getUserAvatarColor: (name) => {
    if (!name) return '#1890ff';
    
    const colors = [
      '#1890ff', // Blue
      '#52c41a', // Green
      '#faad14', // Orange
      '#f5222d', // Red
      '#722ed1', // Purple
      '#13c2c2', // Cyan
      '#eb2f96', // Magenta
      '#fa541c', // Volcano
    ];
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  },

  // Check if user can access route
  canAccessRoute: (user, routePermissions) => {
    if (!user || !user.role) return false;
    
    if (user.role === 'admin') return true;
    
    if (!routePermissions || routePermissions.length === 0) {
      return true; // No restrictions
    }
    
    const userPermissions = authUtils.getUserPermissions(user.role);
    return routePermissions.some(permission => 
      userPermissions.includes(permission)
    );
  },

  // Get user role display name
  getRoleDisplayName: (role) => {
    const roleNames = {
      admin: 'Administrator',
      tutor: 'Tutor',
      student: 'Student',
    };
    
    return roleNames[role] || role;
  },

  // Check if user needs to verify email
  needsEmailVerification: (user) => {
    return user && !user.emailVerified && user.role !== 'admin';
  },

  // Calculate session timeout
  getSessionTimeout: () => {
    const token = authUtils.getToken();
    if (!token) return 0;
    
    const decoded = authUtils.decodeToken(token);
    if (!decoded || !decoded.exp) return 0;
    
    const expiresIn = decoded.exp * 1000 - Date.now();
    return Math.max(0, expiresIn);
  },

  // Format session timeout
  formatSessionTimeout: (timeout) => {
    if (timeout <= 0) return 'Expired';
    
    const minutes = Math.floor(timeout / 60000);
    const seconds = Math.floor((timeout % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    
    return `${seconds}s`;
  },

  // Create auth headers for API calls
  getAuthHeaders: () => {
    const token = authUtils.getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  },

  // Validate user input
  validateUserInput: (userData) => {
    const errors = {};
    
    if (!userData.name?.trim()) {
      errors.name = 'Name is required';
    } else if (userData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!userData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!authUtils.isValidEmail(userData.email.trim())) {
      errors.email = 'Invalid email format';
    }
    
    if (userData.password) {
      const passwordValidation = authUtils.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0];
      }
    }
    
    if (userData.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(userData.phone)) {
      errors.phone = 'Invalid phone number';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};