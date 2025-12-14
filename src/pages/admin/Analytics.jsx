import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  DatePicker,
  Select,
  Statistic,
  Table,
  Progress,
  Radio,
  Space,
  Button,
  Spin,
  Typography,
} from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  BookOutlined,
  TeamOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useSocket } from '../../contexts/SocketContext';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [dateRange, setDateRange] = useState(null);
  const [stats, setStats] = useState({
    overview: {},
    revenue: [],
    enrollments: [],
    coursePerformance: [],
    userGrowth: [],
    platformMetrics: {},
  });

  const { notifications } = useSocket();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAnalytics({
        period: timeRange,
        dateRange,
      });
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const revenueChartData = stats.revenue || [];
  const enrollmentChartData = stats.enrollments || [];
  const coursePerformanceData = stats.coursePerformance || [];
  const userGrowthData = stats.userGrowth || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const overviewCards = [
    {
      title: 'Total Revenue',
      value: `₵${stats.overview?.totalRevenue?.toLocaleString() || '0'}`,
      change: stats.overview?.revenueChange || 0,
      icon: <DollarOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Total Enrollments',
      value: stats.overview?.totalEnrollments?.toLocaleString() || '0',
      change: stats.overview?.enrollmentChange || 0,
      icon: <UserOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Active Courses',
      value: stats.overview?.activeCourses?.toLocaleString() || '0',
      change: stats.overview?.courseChange || 0,
      icon: <BookOutlined />,
      color: '#faad14',
    },
    {
      title: 'Active Tutors',
      value: stats.overview?.activeTutors?.toLocaleString() || '0',
      change: stats.overview?.tutorChange || 0,
      icon: <TeamOutlined />,
      color: '#722ed1',
    },
  ];

  const columns = [
    {
      title: 'Course',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Enrollments',
      dataIndex: 'enrollments',
      key: 'enrollments',
      render: (value) => (
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>{value}</span>
            <span>{((value / (stats.overview?.totalEnrollments || 1)) * 100).toFixed(1)}%</span>
          </div>
          <Progress
            percent={((value / (stats.overview?.totalEnrollments || 1)) * 100).toFixed(1)}
            size="small"
            showInfo={false}
            strokeColor="#1890ff"
          />
        </div>
      ),
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => `₵${value?.toLocaleString()}`,
    },
    {
      title: 'Completion Rate',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (value) => (
        <Progress
          percent={value}
          size="small"
          status={value > 70 ? 'success' : value > 40 ? 'normal' : 'exception'}
        />
      ),
    },
    {
      title: 'Avg Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{value}/5</span>
          <div style={{ color: '#faad14' }}>
            {'★'.repeat(Math.floor(value))}
            {'☆'.repeat(5 - Math.floor(value))}
          </div>
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading analytics..." />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Analytics Dashboard</Title>
        <Space>
          <Radio.Group
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="daily">Daily</Radio.Button>
            <Radio.Button value="weekly">Weekly</Radio.Button>
            <Radio.Button value="monthly">Monthly</Radio.Button>
            <Radio.Button value="quarterly">Quarterly</Radio.Button>
            <Radio.Button value="yearly">Yearly</Radio.Button>
          </Radio.Group>
          <RangePicker
            onChange={(dates) => setDateRange(dates)}
            style={{ width: 256 }}
          />
          <Button icon={<FilterOutlined />}>Filters</Button>
          <Button icon={<DownloadOutlined />} type="primary">
            Export Report
          </Button>
        </Space>
      </div>

      {/* Overview Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {overviewCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary">{card.title}</Text>
                  <div style={{ fontSize: 24, fontWeight: 600, margin: '8px 0' }}>
                    {card.value}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {card.change >= 0 ? (
                      <ArrowUpOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                    )}
                    <Text style={{ color: card.change >= 0 ? '#52c41a' : '#ff4d4f' }}>
                      {Math.abs(card.change)}%
                    </Text>
                    <Text type="secondary">vs previous period</Text>
                  </div>
                </div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `${card.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  color: card.color,
                }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Revenue Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₵${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#52c41a"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#faad14"
                  strokeDasharray="5 5"
                  name="Projected"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Enrollment Trends">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="paid" fill="#1890ff" name="Paid Enrollments" />
                <Bar dataKey="free" fill="#52c41a" name="Free Enrollments" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Course Performance">
            <Table
              columns={columns}
              dataSource={coursePerformanceData}
              rowKey="id"
              pagination={false}
              scroll={{ x: 600 }}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="User Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Students', value: stats.platformMetrics?.students || 0 },
                    { name: 'Tutors', value: stats.platformMetrics?.tutors || 0 },
                    { name: 'Admins', value: stats.platformMetrics?.admins || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Students', color: '#0088FE' },
                    { name: 'Tutors', color: '#00C49F' },
                    { name: 'Admins', color: '#FFBB28' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Users']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Platform Metrics */}
      <Card title="Platform Metrics" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Average Session Duration"
              value={stats.platformMetrics?.avgSessionDuration || 0}
              suffix="min"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Bounce Rate"
              value={stats.platformMetrics?.bounceRate || 0}
              suffix="%"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="New Users (30d)"
              value={stats.platformMetrics?.newUsers30d || 0}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Active Users (7d)"
              value={stats.platformMetrics?.activeUsers7d || 0}
            />
          </Col>
        </Row>
      </Card>

      {/* User Growth Chart */}
      <Card title="User Growth Over Time">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalUsers"
              stroke="#1890ff"
              strokeWidth={2}
              name="Total Users"
            />
            <Line
              type="monotone"
              dataKey="activeUsers"
              stroke="#52c41a"
              name="Active Users"
            />
            <Line
              type="monotone"
              dataKey="newUsers"
              stroke="#faad14"
              name="New Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Real-time Updates */}
      {notifications.length > 0 && (
        <Card title="Recent Activity" style={{ marginTop: 24 }}>
          <Space orientation="vertical" style={{ width: '100%' }}>
            {notifications.slice(0, 5).map((note, index) => (
              <div
                key={index}
                style={{
                  padding: 12,
                  background: '#fafafa',
                  borderRadius: 6,
                  borderLeft: `4px solid ${note.type === 'NEW_COURSE' ? '#1890ff' :
                      note.type === 'NEW_ENROLLMENT' ? '#52c41a' :
                        note.type === 'NEW_PAYMENT' ? '#722ed1' : '#faad14'
                    }`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>{note.type?.replace('_', ' ')}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(note.timestamp).toLocaleTimeString()}
                  </Text>
                </div>
                <Text type="secondary">{note.message}</Text>
              </div>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default Analytics;