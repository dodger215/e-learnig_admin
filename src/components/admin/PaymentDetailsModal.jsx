import React from 'react';
import { Modal, Descriptions, Tag, Timeline, Divider, Space, Button } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  BookOutlined,
  CopyOutlined
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const PaymentDetailsModal = ({ 
  visible, 
  onCancel, 
  payment,
  loading 
}) => {
  if (!payment) return null;

  const getStatusTag = (status) => {
    const statusConfig = {
      'success': { color: 'green', icon: <CheckCircleOutlined />, text: 'Success' },
      'pending': { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending' },
      'failed': { color: 'red', icon: <CloseCircleOutlined />, text: 'Failed' },
      'refunded': { color: 'purple', icon: null, text: 'Refunded' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    
    return (
      <Tag 
        icon={config.icon} 
        color={config.color}
        style={{ fontWeight: 'bold' }}
      >
        {config.text.toUpperCase()}
      </Tag>
    );
  };

  const getTimelineItems = () => {
    const items = [
      {
        color: 'green',
        children: (
          <div>
            <strong>Payment Initialized</strong>
            <div>{dayjs(payment.createdAt).format('DD MMM YYYY, hh:mm A')}</div>
          </div>
        ),
      },
    ];

    if (payment.verifiedAt) {
      items.push({
        color: 'blue',
        children: (
          <div>
            <strong>Payment Verified</strong>
            <div>{dayjs(payment.verifiedAt).format('DD MMM YYYY, hh:mm A')}</div>
          </div>
        ),
      });
    }

    if (payment.status === 'success') {
      items.push({
        color: 'green',
        children: (
          <div>
            <strong>Enrollment Completed</strong>
            <div>Student enrolled in course</div>
          </div>
        ),
      });
    }

    if (payment.status === 'failed') {
      items.push({
        color: 'red',
        children: (
          <div>
            <strong>Payment Failed</strong>
            <div>{payment.failureReason || 'Payment could not be processed'}</div>
          </div>
        ),
      });
    }

    return items;
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(payment.paymentReference);
    message.success('Reference copied to clipboard');
  };

  return (
    <Modal
      title="Payment Details"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
        payment.status === 'pending' && (
          <Button key="retry" type="primary">
            Retry Payment
          </Button>
        ),
        payment.status === 'success' && (
          <Button key="refund" danger>
            Issue Refund
          </Button>
        ),
      ]}
      width={700}
    >
      <div style={{ marginBottom: 24 }}>
        <Space align="center" size="large">
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>
            ₵{payment.amount}
          </div>
          {getStatusTag(payment.status)}
          <Tag color="blue">
            {payment.paymentMethod || 'Paystack'}
          </Tag>
        </Space>
      </div>

      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Payment Reference" span={2}>
          <Space>
            <code>{payment.paymentReference}</code>
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              size="small"
              onClick={handleCopyReference}
            />
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Transaction Date">
          {dayjs(payment.createdAt).format('DD MMM YYYY, hh:mm A')}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {dayjs(payment.updatedAt).fromNow()}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <h4>
            <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Student Information
          </h4>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Name">
              {payment.student?.name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {payment.student?.email || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="User ID">
              {payment.studentId}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div style={{ flex: 1 }}>
          <h4>
            <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Course Information
          </h4>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Course">
              {payment.course?.title || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Tutor">
              {payment.course?.tutor?.name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Course ID">
              {payment.courseId}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>

      {payment.tutor && (
        <div style={{ marginBottom: 24 }}>
          <h4>
            <UserOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            Tutor Earnings
          </h4>
          <Descriptions bordered column={3} size="small">
            <Descriptions.Item label="Tutor Name">
              {payment.tutor.name}
            </Descriptions.Item>
            <Descriptions.Item label="Amount Earned">
              ₵{payment.tutorEarnings || (payment.amount * 0.7).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Platform Fee">
              ₵{payment.platformFee || (payment.amount * 0.3).toFixed(2)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}

      <Divider />

      <h4>Payment Timeline</h4>
      <Timeline items={getTimelineItems()} />

      {payment.metadata && (
        <>
          <Divider />
          <h4>Additional Information</h4>
          <pre style={{ 
            background: '#f6f8fa', 
            padding: 12, 
            borderRadius: 6,
            fontSize: 12,
            maxHeight: 200,
            overflow: 'auto'
          }}>
            {JSON.stringify(payment.metadata, null, 2)}
          </pre>
        </>
      )}

      {payment.notes && (
        <>
          <Divider />
          <h4>Admin Notes</h4>
          <div style={{ 
            background: '#fffbe6', 
            padding: 12, 
            borderRadius: 6,
            border: '1px solid #ffe58f'
          }}>
            {payment.notes}
          </div>
        </>
      )}
    </Modal>
  );
};

PaymentDetailsModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  payment: PropTypes.object,
  loading: PropTypes.bool,
};

export default PaymentDetailsModal;