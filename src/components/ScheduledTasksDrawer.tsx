import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  message,
  Tag,
  DatePicker,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase, AgentScheduledTask } from '@/lib/supabase';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface ScheduledTasksDrawerProps {
  visible: boolean;
  agentId: string | null;
  onClose: () => void;
}

const ScheduledTasksDrawer: React.FC<ScheduledTasksDrawerProps> = ({
  visible,
  agentId,
  onClose,
}) => {
  const [tasks, setTasks] = useState<AgentScheduledTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<AgentScheduledTask | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && agentId) {
      fetchTasks();
    }
  }, [visible, agentId]);

  const fetchTasks = async () => {
    if (!agentId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_scheduled_tasks')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      message.error('获取定时任务失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    form.resetFields();
    form.setFieldsValue({
      push_type: 'platform_internal',
      enabled: true,
      failure_detection: {
        notifyManager: false,
      }
    });
    setFormVisible(true);
  };

  const handleEdit = (task: AgentScheduledTask) => {
    setEditingTask(task);
    form.setFieldsValue({
      trigger_time: task.trigger_time,
      trigger_prompt: task.trigger_prompt,
      push_type: task.push_type,
      group_chat_id: task.group_chat_id,
      enabled: task.enabled,
      failure_keywords: task.failure_detection?.keywords?.join(', '),
      failure_count: task.failure_detection?.failureCount,
      notify_manager: task.failure_detection?.notifyManager,
    });
    setFormVisible(true);
  };

  const handleDelete = (task: AgentScheduledTask) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个定时任务吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('agent_scheduled_tasks')
            .delete()
            .eq('id', task.id);

          if (error) throw error;
          message.success('删除成功');
          fetchTasks();
        } catch (error: any) {
          message.error('删除失败: ' + error.message);
        }
      },
    });
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();

      const taskData = {
        agent_id: agentId,
        trigger_time: values.trigger_time,
        trigger_prompt: values.trigger_prompt || null,
        push_type: values.push_type,
        group_chat_id: values.group_chat_id || null,
        enabled: values.enabled,
        failure_detection: {
          keywords: values.failure_keywords
            ? values.failure_keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
            : [],
          failureCount: values.failure_count || 0,
          notifyManager: values.notify_manager || false,
        },
      };

      if (editingTask) {
        const { error } = await supabase
          .from('agent_scheduled_tasks')
          .update(taskData)
          .eq('id', editingTask.id);

        if (error) throw error;
        message.success('任务更新成功');
      } else {
        const { error } = await supabase
          .from('agent_scheduled_tasks')
          .insert([taskData]);

        if (error) throw error;
        message.success('任务创建成功');
      }

      setFormVisible(false);
      fetchTasks();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请填写必填字段');
      } else {
        message.error('保存失败: ' + error.message);
      }
    }
  };

  const columns = [
    {
      title: '触发时间',
      dataIndex: 'trigger_time',
      key: 'trigger_time',
      width: 150,
    },
    {
      title: '推送方式',
      dataIndex: 'push_type',
      key: 'push_type',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'platform_internal' ? 'blue' : 'green'}>
          {type === 'platform_internal' ? '平台内' : '群聊'}
        </Tag>
      ),
    },
    {
      title: '群聊号',
      dataIndex: 'group_chat_id',
      key: 'group_chat_id',
      width: 120,
      render: (id: string) => id || '-',
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>{enabled ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: AgentScheduledTask) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title="定时任务管理"
        placement="right"
        onClose={onClose}
        open={visible}
        width={800}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建任务
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Drawer>

      <Modal
        title={editingTask ? '编辑定时任务' : '新建定时任务'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={handleFormSubmit}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="触发时间/频率"
            name="trigger_time"
            rules={[{ required: true, message: '请输入触发时间' }]}
            extra="例如：每天 09:00、每周一 10:00、2024-12-05 14:00"
          >
            <Input placeholder="请输入触发时间/频率" />
          </Form.Item>

          <Form.Item
            label="触发提示词"
            name="trigger_prompt"
          >
            <TextArea
              placeholder="请输入触发提示词（选填）"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="推送方式"
            name="push_type"
            rules={[{ required: true, message: '请选择推送方式' }]}
          >
            <Select>
              <Option value="platform_internal">平台内</Option>
              <Option value="group_chat">群聊</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.push_type !== currentValues.push_type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('push_type') === 'group_chat' && (
                <Form.Item
                  label="群聊号"
                  name="group_chat_id"
                  rules={[
                    {
                      required: getFieldValue('push_type') === 'group_chat',
                      message: '请输入群聊号',
                    },
                  ]}
                >
                  <Input placeholder="请输入群聊号" />
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item label="失败拦截机制">
            <Form.Item
              label="失败检测关键词"
              name="failure_keywords"
              extra="多个关键词用逗号分隔，输出中包含这些关键词时判定为失败"
            >
              <Input placeholder="例如：错误, 失败, error" />
            </Form.Item>

            <Form.Item
              label="失败通知次数"
              name="failure_count"
              extra="连续失败多少次后通知管理员"
            >
              <InputNumber
                min={0}
                placeholder="输入失败次数"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="通知管理员"
              name="notify_manager"
              valuePropName="checked"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </Form.Item>

          <Form.Item
            label="启用任务"
            name="enabled"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ScheduledTasksDrawer;
