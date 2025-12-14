import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Input,
  Button,
  Space,
  Tag,
  Tooltip,
  Badge,
  Modal,
  Tabs,
  message,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  DownloadOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import PaymentDetailsModal from '../../components/admin/PaymentDetailsModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    recentTransactions: [],
  });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchText, statusFilter, methodFilter, dateRange, activeTab]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const [paymentsData, statsData] = await Promise.all([
        adminService.getPayments(),
        adminService.getPaymentStats(),
      ]);
      setPayments(paymentsData);
      setStats(statsData);
    } catch (error) {
      message.error('Failed to fetch payments data');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(payment =>
        payment.paymentReference?.toLowerCase().includes(searchText.toLowerCase()) ||
        payment.student?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        payment.course?.title?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === methodFilter);
    }

    // Date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    }

    // Tab filter
    if (activeTab === 'successful') {
      filtered = filtered.filter(p => p.status === 'success');
    } else if (activeTab === 'pending') {
      filtered = filtered.filter(p => p.status === 'pending');
    } else if (activeTab === 'failed') {
      filtered = filtered.filter(p => p.status === 'failed');
    } else if (activeTab === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(p => new Date(p.createdAt) > sevenDaysAgo);
    }

    setFilteredPayments(filtered);
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setViewModalVisible(true);
  };

  const handleRefresh = () => {
    fetchPayments();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, this would trigger a file download
      const csvContent = generateCSV(filteredPayments);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      message.success('Export completed successfully');
    } catch (error) {
      message.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const generateCSV = (data) => {
    const headers = ['Reference', 'Date', 'Student', 'Course', 'Amount', 'Status', 'Method'];
    const rows = data.map(payment => [
      payment.paymentReference,
      new Date(payment.createdAt).toLocaleDateString(),
      payment.student?.name || 'N/A',
      payment.course?.title || 'N/A',
      `₵${payment.amount}`,
      payment.status,
      payment.paymentMethod,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      'success': { color: 'green', icon: <CheckCircleOutlined />, text: 'Success' },
      'pending': { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending' },
      'failed': { color: 'red', icon: <CloseCircleOutlined />, text: 'Failed' },
      'refunded': { color: 'purple', icon: <SyncOutlined />, text: 'Refunded' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };

    return (
      <Tag icon={config.icon} color={config.color} style={{ fontWeight: 'bold' }}>
        {config.text.toUpperCase()}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Reference',
      dataIndex: 'paymentReference',
      key: 'paymentReference',
      width: 180,
      render: (reference) => (
        <code style={{ fontSize: 12 }}>{reference}</code>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => (
        <div>
          <div>{new Date(date).toLocaleDateString()}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      title: 'Student',
      dataIndex: 'student',
      key: 'student',
      width: 150,
      render: (student) => student?.name || 'N/A',
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      width: 200,
      render: (course) => course?.title || 'N/A',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount) => (
        <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
          ₵{amount?.toLocaleString()}
        </div>
      ),
    },
    {
      title: 'Tutor Earnings',
      dataIndex: 'tutorEarnings',
      key: 'tutorEarnings',
      width: 130,
      render: (earnings) => earnings ? `₵${earnings.toLocaleString()}` : 'N/A',
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: (method) => (
        <Tag color="blue">{method || 'N/A'}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: getStatusTag,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
        </Tooltip>
      ),
    },
  ];

  if (loading && payments.length === 0) {
    return <LoadingSpinner fullScreen message="Loading payments..." />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Payments & Transactions</h2>
          <Space>
            <Button
              icon={<SyncOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={exporting}
              type="primary"
            >
              Export
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Total Revenue"
                value={`₵${stats.totalRevenue?.toLocaleString() || '0'}`}
                styles={{ content: { color: '#52c41a' } }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Successful Payments"
                value={stats.successfulPayments || 0}
                styles={{ content: { color: '#1890ff' } }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Pending Payments"
                value={stats.pendingPayments || 0}
                styles={{ content: { color: '#faad14' } }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Failed Payments"
                value={stats.failedPayments || 0}
                styles={{ content: { color: '#ff4d4f' } }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Space wrap>
                <Search
                  placeholder="Search payments..."
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
                  <Option value="success">Success</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="failed">Failed</Option>
                  <Option value="refunded">Refunded</Option>
                </Select>
                <Select
                  placeholder="Method"
                  style={{ width: 140 }}
                  value={methodFilter}
                  onChange={setMethodFilter}
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">All Methods</Option>
                  <Option value="paystack">Paystack</Option>
                  <Option value="card">Card</Option>
                  <Option value="bank">Bank Transfer</Option>
                  <Option value="free">Free</Option>
                </Select>
                <RangePicker
                  style={{ width: 256 }}
                  onChange={setDateRange}
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
            label: `All Payments (${payments.length})`,
          },
          {
            key: 'successful',
            label: `Successful (${stats.successfulPayments || 0})`,
          },
          {
            key: 'pending',
            label: `Pending (${stats.pendingPayments || 0})`,
          },
          {
            key: 'failed',
            label: `Failed (${stats.failedPayments || 0})`,
          },
          {
            key: 'recent',
            label: 'Recent (7 days)',
          },
        ]}
      />

      {/* Payments Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} payments`,
          }}
          scroll={{ x: 1200 }}
          summary={(pageData) => {
            const totalAmount = pageData.reduce((sum, item) => sum + (item.amount || 0), 0);
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <strong>Page Total</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <strong style={{ color: '#1890ff' }}>
                      ₵{totalAmount.toLocaleString()}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} colSpan={4} />
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>

      {/* Recent Transactions */}
      {stats.recentTransactions && stats.recentTransactions.length > 0 && (
        <Card title="Recent Transactions" style={{ marginTop: 24 }}>
          <Row gutter={[16, 16]}>
            {stats.recentTransactions.slice(0, 4).map((transaction, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card size="small" hoverable>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 'bold', margin: '4px 0' }}>
                        ₵{transaction.amount?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {transaction.course?.title}
                      </div>
                    </div>
                    <div>
                      {getStatusTag(transaction.status)}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        visible={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
      />
    </div>
  );
};

export default Payments;