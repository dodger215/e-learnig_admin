import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Row, 
  Col, 
  Avatar, 
  Upload, 
  message,
  InputNumber // FIXED: Added this import
} from 'antd';
import { UserOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Option } = Select;
const { TextArea } = Input;

const TutorModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  form, 
  editingTutor, 
  loading 
}) => {
  const [avatarUrl, setAvatarUrl] = useState(editingTutor?.avatar || '');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit(values);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    if (info.file.status === 'done') {
      setUploading(false);
      const url = info.file.response.url;
      setAvatarUrl(url);
      form.setFieldsValue({ avatar: url });
    }
  };

  const specializations = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'UI/UX Design',
    'DevOps',
    'Cloud Computing',
    'Cybersecurity',
    'Digital Marketing',
    'Business Analytics'
  ];

  return (
    <Modal
      title={editingTutor ? 'Edit Tutor' : 'Create New Tutor'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      okText={editingTutor ? 'Update' : 'Create'}
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'active',
          ...editingTutor
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Upload
            name="avatar"
            showUploadList={false}
            action="/api/upload"
            beforeUpload={beforeUpload}
            onChange={handleAvatarChange}
          >
            <Avatar
              size={100}
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />}
              style={{ 
                cursor: 'pointer',
                border: '2px dashed #d9d9d9',
                padding: 4
              }}
            >
              {uploading && <LoadingOutlined />}
            </Avatar>
            <div style={{ marginTop: 8 }}>
              <UploadOutlined /> Upload Photo
            </div>
          </Upload>
          <Form.Item name="avatar" hidden>
            <Input />
          </Form.Item>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter full name' }]}
            >
              <Input placeholder="John Doe" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter valid email' }
              ]}
            >
              <Input placeholder="john@example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
            >
              <Input placeholder="+234 800 000 0000" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="country"
              label="Country"
            >
              <Input placeholder="Nigeria" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="specialization"
          label="Specialization"
          rules={[{ required: true, message: 'Please select specialization' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select specializations"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {specializations.map(spec => (
              <Option key={spec} value={spec.toLowerCase().replace(' ', '-')}>
                {spec}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="bio"
          label="Bio/Introduction"
          rules={[{ required: true, message: 'Please enter bio' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Brief introduction about yourself, experience, and teaching style..." 
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="experience"
              label="Experience (years)"
            >
              <InputNumber min={0} max={50} style={{ width: '100%' }} /> {/* FIXED */}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="hourlyRate"
              label="Hourly Rate (₵)"
            >
              <InputNumber min={0} style={{ width: '100%' }} /> {/* FIXED */}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="status"
              label="Account Status"
            >
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="pending">Pending Approval</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="education"
          label="Education Background"
        >
          <TextArea 
            rows={2} 
            placeholder="e.g., B.Sc Computer Science, University of Lagos" 
          />
        </Form.Item>

        <Form.Item
          name="certifications"
          label="Certifications"
        >
          <TextArea 
            rows={2} 
            placeholder="e.g., AWS Certified, Google Professional Certificate" 
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="linkedin"
              label="LinkedIn Profile"
            >
              <Input placeholder="https://linkedin.com/in/username" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="website"
              label="Personal Website"
            >
              <Input placeholder="https://example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="notes"
          label="Admin Notes"
        >
          <TextArea 
            rows={2} 
            placeholder="Internal notes about this tutor..." 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

TutorModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  editingTutor: PropTypes.object,
  loading: PropTypes.bool,
};

export default TutorModal;