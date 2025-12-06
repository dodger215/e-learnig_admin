import React, { useState } from 'react';
import { Badge, Dropdown, List, Button, Space, Typography } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useSocket } from '../../contexts/SocketContext';

const { Text } = Typography;

const NotificationBell = () => {
  const { notifications } = useSocket();
  const [visible, setVisible] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    // Implement mark all as read logic
  };

  const handleNotificationClick = (notification) => {
    // Handle notification click
    console.log('Notification clicked:', notification);
  };

  const notificationItems = [
    {
      key: 'header',
      label: (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Text strong>Notifications</Text>
          {unreadCount > 0 && (
            <Button 
              type="link" 
              size="small" 
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'content',
      label: (
        <div style={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
              No notifications yet
            </div>
          ) : (
            <List
              size="small"
              dataSource={notifications.slice(0, 10)}
              renderItem={(item, index) => (
                <List.Item 
                  style={{ 
                    cursor: 'pointer',
                    background: !item.read ? '#e6f7ff' : 'transparent',
                    padding: '12px',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onClick={() => handleNotificationClick(item)}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{item.type}</Text>
                        {!item.read && <Badge status="processing" />}
                      </Space>
                    }
                    description={
                      <div>
                        <Text type="secondary">{item.message}</Text>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items: notificationItems }}
      open={visible}
      onOpenChange={setVisible}
      placement="bottomRight"
      trigger={['click']}
    >
      <Badge count={unreadCount} size="small">
        <BellOutlined 
          style={{ 
            fontSize: 18, 
            cursor: 'pointer',
            color: unreadCount > 0 ? '#1890ff' : undefined
          }} 
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;