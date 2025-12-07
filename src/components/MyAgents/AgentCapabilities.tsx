import React, { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from '../../common/axios';
import CreateTaskModal from './CreateTaskModal';

interface AgentTask {
  id: string;
  agent_id: string;
  agent_name: string;
  task_name: string;
  frequency: string;
  group_chat_numbers: string[];
  is_active: boolean;
  created_at: string;
}

const AgentCapabilities: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<AgentTask | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await axios.get<AgentTask[]>('/api/my-agents/tasks');
      setTasks(data);
    } catch (error) {
      message.error('获取任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    setModalVisible(true);
  };

  const handleEdit = (task: AgentTask) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleDelete = (taskId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个定时任务吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await axios.delete(`/api/my-agents/tasks/${taskId}`);
          message.success('删除成功');
          fetchTasks();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleToggleStatus = async (taskId: string, isActive: boolean) => {
    try {
      await axios.put(`/api/my-agents/tasks/${taskId}`, { is_active: !isActive });
      message.success(isActive ? '已停用' : '已启用');
      fetchTasks();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    fetchTasks();
  };

  const columns = [
    {
      title: 'Agent 名称',
      dataIndex: 'agent_name',
      key: 'agent_name',
    },
    {
      title: '任务名称',
      dataIndex: 'task_name',
      key: 'task_name',
    },
    {
      title: '执行频率',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (frequency: string) => {
        const frequencyMap: Record<string, string> = {
          daily: '每日',
          weekly: '每周',
          monthly: '每月',
        };
        return frequencyMap[frequency] || frequency;
      },
    },
    {
      title: '接入群聊',
      dataIndex: 'group_chat_numbers',
      key: 'group_chat_numbers',
      render: (numbers: string[]) => (
        <div className="flex flex-wrap gap-1">
          {numbers.map((num, index) => (
            <Tag key={index} color="blue">
              {num}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? '已启用' : '已停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AgentTask) => (
        <div className="flex gap-2">
          <Button
            type="link"
            onClick={() => handleEdit(record)}
            className="text-blue-400 hover:text-blue-300 p-0"
          >
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => handleToggleStatus(record.id, record.is_active)}
            className="text-yellow-400 hover:text-yellow-300 p-0"
          >
            {record.is_active ? '停用' : '启用'}
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.id)}
            className="p-0"
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">定时任务能力</h2>
          <p className="text-sm text-gray-400">为您的 Agent 配置定时执行的任务</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          创建任务
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条任务`,
        }}
      />

      <CreateTaskModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
        editingTask={editingTask}
      />
    </div>
  );
};

export default AgentCapabilities;
