import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, Row, Col, Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import TextArea from 'antd/es/input/TextArea';

const { Option } = Select;

const CourseModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  form, 
  editingCourse, 
  tutors,
  loading 
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingCourse && editingCourse.image) {
      setImageUrl(editingCourse.image);
    }
  }, [editingCourse]);

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

  const handleImageChange = (info) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    if (info.file.status === 'done') {
      setUploading(false);
      setImageUrl(info.file.response.url);
      form.setFieldsValue({ image: info.file.response.url });
    }
  };

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Modal
      title={editingCourse ? 'Edit Course' : 'Create New Course'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      okText={editingCourse ? 'Update' : 'Create'}
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isFree: false,
          isPublished: true,
          duration: 30,
          ...editingCourse
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="title"
              label="Course Title"
              rules={[{ required: true, message: 'Please enter course title' }]}
            >
              <Input placeholder="e.g., Introduction to React" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tutorId"
              label="Assign Tutor"
              rules={[{ required: true, message: 'Please select a tutor' }]}
            >
              <Select
                placeholder="Select tutor"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {tutors?.map(tutor => (
                  <Option key={tutor._id} value={tutor._id}>
                    {tutor.name} ({tutor.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter course description' }]}
        >
          <TextArea rows={3} placeholder="Describe the course content and objectives..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category">
                <Option value="web-development">Web Development</Option>
                <Option value="mobile-development">Mobile Development</Option>
                <Option value="data-science">Data Science</Option>
                <Option value="design">Design</Option>
                <Option value="business">Business</Option>
                <Option value="marketing">Marketing</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="level"
              label="Difficulty Level"
              rules={[{ required: true, message: 'Please select level' }]}
            >
              <Select placeholder="Select level">
                <Option value="beginner">Beginner</Option>
                <Option value="intermediate">Intermediate</Option>
                <Option value="advanced">Advanced</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="duration"
              label="Duration (days)"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <InputNumber min={1} max={365} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="price"
              label="Price (₵)"
              dependencies={['isFree']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!getFieldValue('isFree') && (!value || value <= 0)) {
                      return Promise.reject(new Error('Please enter price'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
                disabled={form.getFieldValue('isFree')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="isFree"
              label="Free Course"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="isPublished"
              label="Publish Course"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="learningOutcomes"
          label="Learning Outcomes"
          extra="Enter each outcome on a new line"
        >
          <TextArea 
            rows={3} 
            placeholder="• Understand basic concepts&#10;• Build real projects&#10;• Master advanced topics" 
          />
        </Form.Item>

        <Form.Item
          name="prerequisites"
          label="Prerequisites"
        >
          <Input placeholder="e.g., Basic JavaScript knowledge" />
        </Form.Item>

        <Form.Item
          name="image"
          label="Course Thumbnail"
          extra="Recommended size: 1280x720px"
        >
          <Upload
            name="image"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action="/api/upload"
            beforeUpload={beforeUpload}
            onChange={handleImageChange}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="course" style={{ width: '100%' }} />
            ) : (
              uploadButton
            )}
          </Upload>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tags"
              label="Tags"
              extra="Separate tags with commas"
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="e.g., react, javascript, frontend"
                tokenSeparators={[',']}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxStudents"
              label="Maximum Students"
            >
              <InputNumber min={1} max={1000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

CourseModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  editingCourse: PropTypes.object,
  tutors: PropTypes.array,
  loading: PropTypes.bool,
};

export default CourseModal;