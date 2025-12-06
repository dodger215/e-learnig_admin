import api from './api';

export const adminService = {
  // Analytics
  getAnalytics: async (params = {}) => {
    const response = await api.get('/api/admin/analytics', { params });
    return response.data;
  },

  // Tutors
  getTutors: async () => {
    const response = await api.get('/api/admin/tutors');
    return response.data;
  },

  createTutor: async (tutorData) => {
    const response = await api.post('/api/admin/tutors', tutorData);
    return response.data;
  },

  updateTutor: async (id, tutorData) => {
    const response = await api.put(`/api/admin/tutors/${id}`, tutorData);
    return response.data;
  },

  deleteTutor: async (id) => {
    const response = await api.delete(`/api/admin/tutors/${id}`);
    return response.data;
  },

  // Students
  getStudents: async (params = {}) => {
    const response = await api.get('/api/admin/students', { params });
    return response.data;
  },

  updateStudentStatus: async (id, status) => {
    const response = await api.patch(`/api/admin/students/${id}/status`, { status });
    return response.data;
  },

  // Payments
  getPayments: async (params = {}) => {
    const response = await api.get('/api/admin/payments', { params });
    return response.data;
  },

  getPaymentStats: async () => {
    const response = await api.get('/api/admin/payments/stats');
    return response.data;
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await api.get('/api/admin/dashboard/stats');
    return response.data;
  },

  // Courses
  getCourses: async () => {
    const response = await api.get('/api/courses');
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await api.post('/api/courses', courseData);
    return response.data;
  },

  updateCourse: async (id, courseData) => {
    const response = await api.put(`/api/courses/${id}`, courseData);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/api/courses/${id}`);
    return response.data;
  },

  assignCourse: async (tutorId, courseId) => {
    const response = await api.post('/api/admin/assign-course', { tutorId, courseId });
    return response.data;
  },

  // Bulk Actions
  bulkUpdateTutorStatus: async (ids, status) => {
    const response = await api.post('/api/admin/tutors/bulk-status', { ids, status });
    return response.data;
  },

  bulkExportStudents: async (params) => {
    const response = await api.get('/api/admin/students/export', { 
      params,
      responseType: 'blob' 
    });
    return response.data;
  },

  // Notifications
  sendAnnouncement: async (data) => {
    const response = await api.post('/api/admin/announcements', data);
    return response.data;
  },

  // System
  getSystemHealth: async () => {
    const response = await api.get('/api/admin/system/health');
    return response.data;
  },
};