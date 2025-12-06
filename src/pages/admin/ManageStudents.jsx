import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Avatar,
  Card,
  Row,
  Col,
  Select,
  Statistic,
  Modal,
  Tabs,
  Badge,
  Tooltip,
  Popconfirm,
  message,
  DatePicker,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [enrollmentFilter, setEnrollmentFilter] = useState('all');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchText, statusFilter, enrollmentFilter, activeTab]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await adminService.getStudents();
      setStudents(data);
    } catch (error) {
      message.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    // Enrollment filter
    if (enrollmentFilter !== 'all') {
      if (enrollmentFilter === 'enrolled') {
        filtered = filtered.filter(student => student.courseCount > 0);
      } else if (enrollmentFilter === 'not-enrolled') {
        filtered = filtered.filter(student => student.courseCount === 0);
      }
    }

    // Tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter(student => student.status === 'active');
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(student => student.status === 'inactive');
    } else if (activeTab === 'new') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(student => 
        new Date(student.createdAt) > sevenDaysAgo
      );
    }

    setFilteredStudents(filtered);
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setViewModalVisible(true);
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await adminService.updateStudentStatus(studentId, newStatus);
      message.success(`Student ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchStudents();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handleExport = () => {
    // Export logic here
    message.success('Export started');
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'green', icon: <CheckCircleOutlined />, text: 'Active' },
      inactive: { color: 'red', icon: <CloseCircleOutlined />, text: 'Inactive' },
      pending: { color: 'orange', text: 'Pending' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };

    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || 'N/A',
    },
    {
      title: 'Courses',
      dataIndex: 'courseCount',
      key: 'courseCount',
      render: (count) => (
        <Badge
          count={count}
          style={{ backgroundColor: count > 0 ? '#52c41a' : '#999' }}
          showZero
        />
      ),
    },
    {
      title: 'Enrollments',
      dataIndex: 'activeEnrollments',
      key: 'activeEnrollments',
      render: (enrollments) => enrollments || 0,
    },
    {
      title: 'Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (amount) => amount ? `₵${amount.toLocaleString()}` : '₵0',
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Send Email">
            <Button
              type="text"
              icon={<MailOutlined />}
              onClick={() => window.open(`mailto:${record.email}`)}
            />
          </Tooltip>
          <Popconfirm
            title={`${record.status === 'active' ? 'Deactivate' : 'Activate'} this student?`}
            onConfirm={() => handleStatusChange(
              record._id,
              record.status === 'active' ? 'inactive' : 'active'
            )}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title={record.status === 'active' ? 'Deactivate' : 'Activate'}>
              <Button
                type="text"
                danger={record.status === 'active'}
                icon={record.status === 'active' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && students.length === 0) {
    return <LoadingSpinner fullScreen message="Loading students..." />;
  }

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    enrolled: students.filter(s => s.courseCount > 0).length,
    totalRevenue: students.reduce((sum, s) => sum + (s.totalSpent || 0), 0),
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Student Management</h2>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            Export Data
          </Button>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Total Students"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Active Students"
                value={stats.active}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Enrolled Students"
                value={stats.enrolled}
                valueStyle={{ color: '#faad14' }}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Total Revenue"
                value={`₵${stats.totalRevenue.toLocaleString()}`}
                valueStyle={{ color: '#722ed1' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Space>
                <Search
                  placeholder="Search students..."
                  prefix={<SearchOutlined />}
                  style={{ width: 300 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
                <Select
                  placeholder="Status"
                  style={{ width: 120 }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
                <Select
                  placeholder="Enrollment"
                  style={{ width: 140 }}
                  value={enrollmentFilter}
                  onChange={setEnrollmentFilter}
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">All Students</Option>
                  <Option value="enrolled">Enrolled</Option>
                  <Option value="not-enrolled">Not Enrolled</Option>
                </Select>
                <RangePicker
                  style={{ width: 256 }}
                  placeholder={['Start Date', 'End Date']}
                />
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: 16 }}
        items={[
          {
            key: 'all',
            label: `All Students (${students.length})`,
          },
          {
            key: 'active',
            label: `Active (${stats.active})`,
          },
          {
            key: 'inactive',
            label: `Inactive (${stats.total - stats.active})`,
          },
          {
            key: 'new',
            label: 'New This Week',
          },
        ]}
      />

      {/* Students Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} students`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Student Details Modal */}
      <Modal
        title="Student Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="message"
            type="primary"
            icon={<MailOutlined />}
            onClick={() => window.open(`mailto:${selectedStudent?.email}`)}
          >
            Send Message
          </Button>,
        ]}
        width={800}
      >
        {selectedStudent && (
          <div>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar size={80} src={selectedStudent.avatar} />
                  <Title level={3} style={{ marginTop: 16 }}>
                    {selectedStudent.name}
                  </Title>
                  <Space>
                    {getStatusTag(selectedStudent.status)}
                    <Tag color="blue">
                      Member since {new Date(selectedStudent.createdAt).toLocaleDateString()}
                    </Tag>
                  </Space>
                </div>
              </Col>

              <Col span={24}>
                <Card title="Contact Information" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <MailOutlined />
                        <span>{selectedStudent.email}</span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <PhoneOutlined />
                        <span>{selectedStudent.phone || 'Not provided'}</span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CalendarOutlined />
                        <span>
                          Joined: {new Date(selectedStudent.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOutlined />
                        <span>Courses: {selectedStudent.courseCount || 0}</span>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Enrollment Stats" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Active Courses:</span>
                      <strong>{selectedStudent.activeEnrollments || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Completed Courses:</span>
                      <strong>{selectedStudent.completedCourses || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Spent:</span>
                      <strong>₵{(selectedStudent.totalSpent || 0).toLocaleString()}</strong>
                    </div>
                  </Space>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Recent Activity" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      Last login: {selectedStudent.lastLogin ? 
                        new Date(selectedStudent.lastLogin).toLocaleString() : 
                        'Never'
                      }
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      Last enrollment: {selectedStudent.lastEnrollment ?
                        new Date(selectedStudent.lastEnrollment).toLocaleDateString() :
                        'Never'
                      }
                    </div>
                  </Space>
                </Card>
              </Col>

              {selectedStudent.enrolledCourses && selectedStudent.enrolledCourses.length > 0 && (
                <Col span={24}>
                  <Card title="Enrolled Courses" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {selectedStudent.enrolledCourses.slice(0, 3).map((course, index) => (
                        <div
                          key={index}
                          style={{
                            padding: 8,
                            background: '#fafafa',
                            borderRadius: 4,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span>{course.title}</span>
                          <Tag color={course.status === 'active' ? 'green' : 'default'}>
                            {course.status}
                          </Tag>
                        </div>
                      ))}
                      {selectedStudent.enrolledCourses.length > 3 && (
                        <div style={{ textAlign: 'center', color: '#1890ff', cursor: 'pointer' }}>
                          +{selectedStudent.enrolledCourses.length - 3} more courses
                        </div>
                      )}
                    </Space>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageStudents;