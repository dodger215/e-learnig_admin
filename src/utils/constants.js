export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const USER_ROLES = {
  ADMIN: 'admin',
  TUTOR: 'tutor',
  STUDENT: 'student',
};

export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};