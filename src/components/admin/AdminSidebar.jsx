import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  LineChartOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const AdminSidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/analytics',
      icon: <LineChartOutlined />,
      label: 'Analytics',
    },
    {
      key: 'courses',
      icon: <BookOutlined />,
      label: 'Courses',
      children: [
        {
          key: '/admin/courses',
          label: 'Manage Courses',
        },
      ],
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'User Management',
      children: [
        {
          key: '/admin/tutors',
          label: 'Manage Tutors',
        },
        {
          key: '/admin/students',
          label: 'Manage Students',
        },
      ],
    },
    {
      key: '/admin/payments',
      icon: <DollarOutlined />,
      label: 'Payments',
    },
  ];

  const onMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      style={{
        background: '#001529',
        borderRight: '1px solid #f0f0f0',
        height: '100vh', // Full height
        overflow: 'auto',
        position: 'sticky', // Changed from fixed to sticky
        top: 0,
        left: 0,
      }}
    >
      <div style={{ 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#001529',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <h2 style={{ 
          color: '#fff', 
          margin: 0,
          fontSize: collapsed ? '16px' : '18px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          fontWeight: 600,
        }}>
          {collapsed ? 'ELP' : 'E-Learning Admin'}
        </h2>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['courses', 'users']}
        items={menuItems}
        onClick={onMenuClick}
        style={{ 
          borderRight: 0,
          background: '#001529',
          color: 'rgba(255,255,255,0.65)',
          marginTop: 8,
        }}
        theme="dark"
      />
    </Sider>
  );
};

export default AdminSidebar;