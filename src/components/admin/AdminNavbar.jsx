import React from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Badge } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../common/NotificationBell';

const { Header } = Layout;

const AdminNavbar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        height: 64,
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ 
          fontSize: '16px', 
          width: 64, 
          height: 64,
        }}
      />

      <Space size="large">
        <NotificationBell />
        
        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 4, ':hover': { background: '#f5f5f5' } }}>
            <Avatar 
              style={{ 
                backgroundColor: '#1890ff',
                verticalAlign: 'middle',
              }} 
              icon={<UserOutlined />}
            >
              {user?.name?.charAt(0)}
            </Avatar>
            <span style={{ fontWeight: 500 }}>
              {user?.name || 'Admin'}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AdminNavbar;