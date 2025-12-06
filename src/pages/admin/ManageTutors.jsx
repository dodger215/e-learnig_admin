import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Modal,
  Row,
  Col,
  Select,
  Form,
  Card,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useForm } from '../../hooks/useForm';
import { adminService } from '../../services/adminService';
import TutorModal from '../../components/admin/TutorModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { Search } = Input;
const { Option } = Select;

const ManageTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingTutor, setViewingTutor] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTutors();
  }, []);

  useEffect(() => {
    filterTutors();
  }, [tutors, searchText, statusFilter]);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTutors();
      setTutors(data);
    } catch (error) {
      message.error('Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  const filterTutors = () => {
    let filtered = [...tutors];

    if (searchText) {
      filtered = filtered.filter(tutor =>
        tutor.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        tutor.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        tutor.specialization?.some(s => s.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tutor => tutor.status === statusFilter);
    }

    setFilteredTutors(filtered);
  };

  const handleCreate = () => {
    setSelectedTutor(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (tutor) => {
    setSelectedTutor(tutor);
    form.setFieldsValue(tutor);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteTutor(id);
      message.success('Tutor deleted successfully');
      fetchTutors();
    } catch (error) {
      message.error('Failed to delete tutor');
    }
  };

  const handleView = (tutor) => {
    setViewingTutor(tutor);
    setViewModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedTutor) {
        await adminService.updateTutor(selectedTutor._id, values);
        message.success('Tutor updated successfully');
      } else {
        await adminService.createTutor(values);
        message.success('Tutor created successfully');
      }
      setModalVisible(false);
      fetchTutors();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'green', icon: <CheckCircleOutlined />, text: 'Active' },
      inactive: { color: 'red', icon: <CloseCircleOutlined />, text: 'Inactive' },
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending' },
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
      title: 'Tutor',
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
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (specializations) => (
        <div style={{ maxWidth: 200 }}>
          {specializations?.slice(0, 3).map((spec, index) => (
            <Tag key={index} color="blue" style={{ margin: 2 }}>
              {spec}
            </Tag>
          ))}
          {specializations?.length > 3 && (
            <Tooltip title={specializations.slice(3).join(', ')}>
              <Tag>+{specializations.length - 3} more</Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Experience',
      dataIndex: 'experience',
      key: 'experience',
      render: (exp) => `${exp || 0} years`,
    },
    {
      title: 'Courses',
      dataIndex: 'courseCount',
      key: 'courseCount',
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Students',
      dataIndex: 'studentCount',
      key: 'studentCount',
      render: (count) => count?.toLocaleString() || '0',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontWeight: 500 }}>{rating?.toFixed(1) || 'N/A'}</span>
          <div style={{ color: '#faad14' }}>
            {'★'.repeat(Math.floor(rating || 0))}
            {'☆'.repeat(5 - Math.floor(rating || 0))}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
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
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this tutor?"
            description="This will also remove them from assigned courses."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && tutors.length === 0) {
    return <LoadingSpinner fullScreen message="Loading tutors..." />;
  }

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col>
            <Space>
              <Search
                placeholder="Search tutors..."
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
              <Select
                placeholder="Filter by status"
                style={{ width: 150 }}
                value={statusFilter}
                onChange={setStatusFilter}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="pending">Pending</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Add New Tutor
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      {/* <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Tutors"
              value={tutors.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Active Tutors"
              value={tutors.filter(t => t.status === 'active').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Courses"
              value={tutors.reduce((sum, t) => sum + (t.courseCount || 0), 0)}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Avg Rating"
              value={(
                tutors.reduce((sum, t) => sum + (t.rating || 0), 0) / (tutors.length || 1)
              ).toFixed(1)}
              suffix="/5"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row> */}

      {/* Tutors Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTutors}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} tutors`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Tutor Modal */}
      <TutorModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        form={form}
        editingTutor={selectedTutor}
      />

      {/* View Tutor Modal */}
      <Modal
        title="Tutor Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setViewModalVisible(false);
              handleEdit(viewingTutor);
            }}
          >
            Edit
          </Button>,
        ]}
        width={700}
      >
        {viewingTutor && (
          <div>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar size={100} src={viewingTutor.avatar} />
                  <Title level={3} style={{ marginTop: 16 }}>
                    {viewingTutor.name}
                  </Title>
                  <Space>
                    {getStatusTag(viewingTutor.status)}
                    <Tag color="blue">
                      {viewingTutor.experience || 0} years experience
                    </Tag>
                  </Space>
                </div>
              </Col>

              <Col span={24}>
                <Card title="Contact Information" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MailOutlined />
                        <span>{viewingTutor.email}</span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PhoneOutlined />
                        <span>{viewingTutor.phone || 'Not provided'}</span>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Specialization" size="small">
                  <Space wrap>
                    {viewingTutor.specialization?.map((spec, index) => (
                      <Tag key={index} color="blue">
                        {spec}
                      </Tag>
                    )) || 'Not specified'}
                  </Space>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Bio" size="small">
                  <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {viewingTutor.bio || 'No bio provided'}
                  </p>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Education" size="small">
                  <p style={{ margin: 0 }}>{viewingTutor.education || 'Not provided'}</p>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Certifications" size="small">
                  <p style={{ margin: 0 }}>{viewingTutor.certifications || 'Not provided'}</p>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageTutors;