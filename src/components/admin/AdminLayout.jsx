import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f0f2f5',

      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: '#f0f2f5' 
    }}>
      {/* Sidebar */}
      <div style={{
        width: collapsed ? 80 : 250,
        transition: 'width 0.2s',
        flexShrink: 0,
        background: '#001529',
        position: 'relative',
        zIndex: 10,
      }}>
        <AdminSidebar collapsed={collapsed} />
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: collapsed ? "200vh" : "181vh",
        minWidth: 0, 
      }}>
        <AdminNavbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
        }}>
            <div style={{
                flex: 1,
                margin: '24px 16px',
                padding: 24,
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'auto', // For scrolling
            }}>
                <Outlet />
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;