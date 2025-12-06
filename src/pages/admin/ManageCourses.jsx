import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  message,
  Tag,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import CourseModal from '../../components/admin/CourseModal';
import { adminService } from '../../services/adminService';

const { Search } = Input;
const { Option } = Select;

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCourses();
    fetchTutors();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCourses();
      setCourses(data);
    } catch (error) {
      message.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchTutors = async () => {
    try {
      const data = await adminService.getTutors();
      setTutors(data);
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
    }
  };

  const handleCreate = () => {
    setEditingCourse(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    form.setFieldsValue({
      ...course,
      tutorId: course.tutor?._id,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteCourse(id);
      message.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      message.error('Failed to delete course');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCourse) {
        await adminService.updateCourse(editingCourse._id, values);
        message.success('Course updated successfully');
      } else {
        await adminService.createCourse(values);
        message.success('Course created successfully');
      }
      setModalVisible(false);
      fetchCourses();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Tutor',
      dataIndex: 'tutor',
      key: 'tutor',
      render: (tutor) => tutor?.name || 'N/A',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        record.isFree ? (
          <Tag color="green">FREE</Tag>
        ) : (
          `₵${price}`
        )
      ),
    },
    {
      title: 'Students',
      dataIndex: 'students',
      key: 'students',
      render: (students) => students?.length || 0,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} days`,
    },
    {
      title: 'Status',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished) => (
        <Tag color={isPublished ? 'blue' : 'red'}>
          {isPublished ? 'Published' : 'Draft'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {/* View details */}}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this course?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Search
          placeholder="Search courses..."
          style={{ width: 300 }}
          onSearch={(value) => {/* Implement search */}}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Add Course
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />

      <CourseModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        form={form}
        editingCourse={editingCourse}
        tutors={tutors}
      />
    </div>
  );
};

export default ManageCourses;