import { useAuth } from './useAuth';

export const usePermission = () => {
  const { user } = useAuth();

  const hasPermission = useCallback((requiredPermission) => {
    if (!user || !user.role) return false;

    // Define permission matrix based on roles
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
      ],
      student: [
        'view_dashboard',
        'view_courses',
        'enroll_course',
        'submit_assignment',
        'view_grades',
        'join_meeting',
        'view_materials',
      ],
    };

    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes(requiredPermission);
  }, [user]);

  const hasAnyPermission = useCallback((requiredPermissions) => {
    return requiredPermissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((requiredPermissions) => {
    return requiredPermissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  const isTutor = useCallback(() => {
    return user?.role === 'tutor';
  }, [user]);

  const isStudent = useCallback(() => {
    return user?.role === 'student';
  }, [user]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isTutor,
    isStudent,
    userRole: user?.role,
  };
};