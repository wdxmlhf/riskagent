import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import axios from '../../common/axios';

interface AgentTask {
  id: string;
  agent_id: string;
  task_name: string;
  frequency: string;
  group_chat_numbers: string[];
}

interface Agent {
  id: string;
  agent_code: string;
  agent_name: string;
}

interface CreateTaskModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingTask?: AgentTask | null;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editingTask,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    if (visible) {
      fetchAgents();
      if (editingTask) {
        form.setFieldsValue({
          ...editingTask,
          group_chat_numbers: editingTask.group_chat_numbers.join(', '),
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingTask, form]);

  const fetchAgents = async () => {
    try {
      const data = await axios.get<Agent[]>('/api/my-agents/list');
      setAgents(data);
    } catch (error) {
      message.error('获取 Agent 列表失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const groupChatNumbers = values.group_chat_numbers
        ? values.group_chat_numbers.split(',').map((num: string) => num.trim()).filter(Boolean)
        : [];

      const payload = {
        ...values,
        group_chat_numbers: groupChatNumbers,
      };

      if (editingTask) {
        await axios.put(`/api/my-agents/tasks/${editingTask.id}`, payload);
        message.success('更新成功');
      } else {
        await axios.post('/api/my-agents/tasks', payload);
        message.success('创建成功');
      }

      onSuccess();
      form.resetFields();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.response?.data?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const frequencyOptions = [
    { label: '每日', value: 'daily' },
    { label: '每周', value: 'weekly' },
    { label: '每月', value: 'monthly' },
  ];

  return (
    <Modal
      title={editingTask ? '编辑定时任务' : '创建定时任务'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={500}
      okText={editingTask ? '更新' : '创建'}
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="agent_id"
          label="选择 Agent"
          rules={[{ required: true, message: '请选择 Agent' }]}
        >
          <Select
            placeholder="请选择要执行任务的 Agent"
            options={agents.map(agent => ({
              label: agent.agent_name,
              value: agent.id,
            }))}
            disabled={!!editingTask}
          />
        </Form.Item>

        <Form.Item
          name="task_name"
          label="任务名称"
          rules={[
            { required: true, message: '请输入任务名称' },
            { max: 50, message: '任务名称不能超过50个字符' },
          ]}
        >
          <Input placeholder="例如: 每日数据汇总" />
        </Form.Item>

        <Form.Item
          name="frequency"
          label="执行频率"
          rules={[{ required: true, message: '请选择执行频率' }]}
        >
          <Select
            placeholder="请选择频率"
            options={frequencyOptions}
          />
        </Form.Item>

        <Form.Item
          name="group_chat_numbers"
          label="接入群聊号码"
          tooltip="多个号码请用逗号分隔"
        >
          <Input
            placeholder="例如: 12345, 67890"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;
