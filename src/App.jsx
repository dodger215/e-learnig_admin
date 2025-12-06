import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, notification } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import AdminLayout from './components/admin/AdminLayout';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Analytics from './pages/admin/Analytics';
import ManageCourses from './pages/admin/ManageCourses';
import ManageTutors from './pages/admin/ManageTutors';
import ManageStudents from './pages/admin/ManageStudents';
import Payments from './pages/admin/Payments';

// Auth Pages
import Login from './pages/Login';

// Theme configuration
const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorInfo: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    borderRadius: 6,
    colorBgLayout: '#f0f2f5',
  },
  components: {
    Layout: {
      siderBg: '#001529',
      triggerBg: '#002140',
      triggerColor: '#fff',
      bodyBg: '#f0f2f5',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
      darkItemHoverBg: '#003a8c',
    },
  },
};

function App() {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    // Add global CSS
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #f0f2f5;
      }
      
      #root {
        min-height: 100vh;
      }
      
      .ant-layout {
        min-height: 100vh;
      }
      
      .ant-layout-content {
        flex: 1;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <ConfigProvider theme={theme}>
      {contextHolder}
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="courses" element={<ManageCourses />} />
                <Route path="tutors" element={<ManageTutors />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="payments" element={<Payments />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;