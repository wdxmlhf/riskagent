import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import axios from '../../common/axios';

const { TextArea } = Input;

interface Agent {
  id: string;
  agent_code: string;
  agent_name: string;
  agent_category: string;
  agent_belong?: string;
  agent_manager?: string;
  agent_user?: string;
  agent_description: string;
  agent_prompt: string;
  status: boolean;
}

interface CreateAgentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingAgent?: Agent | null;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editingAgent,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (visible && editingAgent) {
      form.setFieldsValue(editingAgent);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editingAgent, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingAgent) {
        await axios.put(`/api/my-agents/${editingAgent.id}`, values);
        message.success('更新成功');
      } else {
        await axios.post('/api/my-agents', values);
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

  const categoryOptions = [
    { label: '数据分析', value: 'data-analysis' },
    { label: '内容创作', value: 'content-creation' },
    { label: '客户服务', value: 'customer-service' },
    { label: '任务管理', value: 'task-management' },
    { label: '知识问答', value: 'qa' },
    { label: '其他', value: 'other' },
  ];

  return (
    <Modal
      title={editingAgent ? '编辑 Agent' : '创建 Agent'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      okText={editingAgent ? '更新' : '创建'}
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: false,
        }}
      >
        <Form.Item
          name="agent_code"
          label="Agent 唯一标识"
          rules={[
            { required: true, message: '请输入 Agent 唯一标识' },
            { pattern: /^[a-zA-Z0-9_-]+$/, message: '只能包含字母、数字、下划线和连字符' },
          ]}
        >
          <Input
            placeholder="例如: data-analyzer-v1"
            disabled={!!editingAgent}
          />
        </Form.Item>

        <Form.Item
          name="agent_name"
          label="Agent 名称"
          rules={[
            { required: true, message: '请输入 Agent 名称' },
            { max: 50, message: '名称不能超过50个字符' },
          ]}
        >
          <Input placeholder="例如: 数据分析助手" />
        </Form.Item>

        <Form.Item
          name="agent_category"
          label="Agent 分类"
          rules={[{ required: true, message: '请选择 Agent 分类' }]}
        >
          <Select
            placeholder="请选择分类"
            options={categoryOptions}
          />
        </Form.Item>

        <Form.Item
          name="agent_belong"
          label="所属团队"
        >
          <Input placeholder="例如: 产品团队" />
        </Form.Item>

        <Form.Item
          name="agent_manager"
          label="负责人"
        >
          <Input placeholder="例如: 张三, 李四" />
        </Form.Item>

        <Form.Item
          name="agent_user"
          label="使用对象"
        >
          <Input placeholder="例如: 全体员工" />
        </Form.Item>

        <Form.Item
          name="agent_description"
          label="Agent 简介"
          rules={[
            { required: true, message: '请输入 Agent 简介' },
            { max: 200, message: '简介不能超过200个字符' },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="请简要描述这个 Agent 的功能和用途"
            showCount
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          name="agent_prompt"
          label="Agent 系统 Prompt"
          rules={[
            { required: true, message: '请输入系统 Prompt' },
            { max: 200, message: 'Prompt 不能超过200个字符' },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="定义 Agent 的行为和角色"
            showCount
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="是否公开"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="公开"
            unCheckedChildren="私有"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateAgentModal;
