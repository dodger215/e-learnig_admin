import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Space, Button, Spin, Alert } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useSocket } from '../../contexts/SocketContext';
import { adminService } from '../../services/adminService';
import StatCard from '../../components/admin/StatCard';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTutors: 0,
    totalCourses: 0,
    totalEarnings: 0,
    recentEnrollments: [],
    recentCourses: [],
  });
  const [loading, setLoading] = useState(true);
  const { notifications } = useSocket();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Course',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₵${amount}`,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{
          color: status === 'active' ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {status.toUpperCase()}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <Alert
          message="Recent Activities"
          description={
            <div>
              {notifications.slice(-3).map((note, index) => (
                <div key={index} style={{ margin: '4px 0' }}>
                  • {note.message}
                </div>
              ))}
            </div>
          }
          type="info"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<UserOutlined />}
            color="#1890ff"
            trend={12}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Tutors"
            value={stats.totalTutors}
            icon={<TeamOutlined />}
            color="#52c41a"
            trend={8}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<BookOutlined />}
            color="#faad14"
            trend={15}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Earnings"
            value={`₵${stats.totalEarnings}`}
            icon={<DollarOutlined />}
            color="#722ed1"
            trend={23}
          />
        </Col>
      </Row>

      {/* Recent Enrollments */}
      <Card
        title="Recent Enrollments"
        style={{ marginTop: 24 }}
        extra={
          <Button type="link" onClick={fetchDashboardData}>
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={stats.recentEnrollments}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      {/* Recent Courses */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Recently Added Courses">
            <Space orientation="vertical" style={{ width: '100%' }}>
              {stats.recentCourses.map((course) => (
                <Card key={course.id} size="small">
                  <Space orientation="vertical" style={{ width: '100%' }}>
                    <strong>{course.title}</strong>
                    <div style={{ color: '#666' }}>{course.tutorName}</div>
                    <Space>
                      <span>Students: {course.studentCount}</span>
                      <span>Price: {course.isFree ? 'Free' : `₵${course.price}`}</span>
                    </Space>
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Quick Actions">
            <Space orientation="vertical" style={{ width: '100%' }}>
              <Button type="primary" block>
                Create New Course
              </Button>
              <Button block>
                Add New Tutor
              </Button>
              <Button block>
                View Reports
              </Button>
              <Button block>
                Send Announcement
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;