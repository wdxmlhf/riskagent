import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { supabase, MyAgent } from '@/lib/supabase';

const { TextArea } = Input;
const { Option } = Select;

interface AgentFormModalProps {
  visible: boolean;
  agent: MyAgent | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AGENT_CATEGORIES = [
  '数据分析',
  '内容生成',
  '任务自动化',
  '客户服务',
  '其他',
];

const AGENT_BELONGS = [
  '技术部',
  '市场部',
  '销售部',
  '运营部',
  '其他',
];

const AgentFormModal: React.FC<AgentFormModalProps> = ({
  visible,
  agent,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [managerOptions, setManagerOptions] = useState<string[]>([]);
  const [userOptions, setUserOptions] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      if (agent) {
        form.setFieldsValue({
          ...agent,
          agent_manager: agent.agent_manager || undefined,
          agent_user: agent.agent_user || undefined,
          agent_belong: agent.agent_belong || undefined,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ status: true });
      }
    }
  }, [visible, agent, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        message.error('请先登录');
        return;
      }

      const agentData = {
        ...values,
        user_id: user.id,
        agent_belong: values.agent_belong || null,
        agent_manager: values.agent_manager || null,
        agent_user: values.agent_user || null,
      };

      if (agent) {
        const { error } = await supabase
          .from('my_agents')
          .update(agentData)
          .eq('id', agent.id);

        if (error) throw error;
        message.success('Agent更新成功');
      } else {
        const { error } = await supabase
          .from('my_agents')
          .insert([agentData]);

        if (error) throw error;
        message.success('Agent创建成功');
      }

      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请填写必填字段');
      } else {
        message.error('保存失败: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManagerSearch = (value: string) => {
    if (value) {
      setManagerOptions([value, '张三', '李四', '王五']);
    } else {
      setManagerOptions([]);
    }
  };

  const handleUserSearch = (value: string) => {
    if (value) {
      setUserOptions([value, '用户A', '用户B', '用户C']);
    } else {
      setUserOptions([]);
    }
  };

  return (
    <Modal
      title={agent ? '编辑Agent' : '新建Agent'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      okText="保存"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Agent代码"
          name="agent_code"
          rules={[{ required: true, message: '请输入Agent代码' }]}
        >
          <Input placeholder="请输入Agent代码" maxLength={50} />
        </Form.Item>

        <Form.Item
          label="Agent名称"
          name="agent_name"
          rules={[
            { required: true, message: '请输入Agent名称' },
            { max: 15, message: '名称不能超过15个字符' },
          ]}
        >
          <Input placeholder="请输入Agent名称" maxLength={15} showCount />
        </Form.Item>

        <Form.Item
          label="Agent分类"
          name="agent_category"
          rules={[{ required: true, message: '请选择Agent分类' }]}
        >
          <Select placeholder="请选择Agent分类">
            {AGENT_CATEGORIES.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Agent归属" name="agent_belong">
          <Select placeholder="请选择Agent归属" allowClear>
            {AGENT_BELONGS.map((belong) => (
              <Option key={belong} value={belong}>
                {belong}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Agent管理员" name="agent_manager">
          <Select
            showSearch
            placeholder="请选择或输入Agent管理员"
            onSearch={handleManagerSearch}
            filterOption={false}
            allowClear
          >
            {managerOptions.map((manager) => (
              <Option key={manager} value={manager}>
                {manager}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Agent使用者" name="agent_user">
          <Select
            showSearch
            placeholder="请选择或输入Agent使用者"
            onSearch={handleUserSearch}
            filterOption={false}
            allowClear
          >
            {userOptions.map((user) => (
              <Option key={user} value={user}>
                {user}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Agent描述"
          name="agent_description"
          rules={[
            { required: true, message: '请输入Agent描述' },
            { max: 200, message: '描述不能超过200个字符' },
          ]}
        >
          <TextArea
            placeholder="请输入Agent描述"
            maxLength={200}
            showCount
            rows={4}
          />
        </Form.Item>

        <Form.Item
          label="Agent提示词"
          name="agent_prompt"
          rules={[
            { required: true, message: '请输入Agent提示词' },
            { max: 200, message: '提示词不能超过200个字符' },
          ]}
        >
          <TextArea
            placeholder="请输入Agent提示词"
            maxLength={200}
            showCount
            rows={4}
          />
        </Form.Item>

        <Form.Item
          label="状态"
          name="status"
          valuePropName="checked"
          rules={[{ required: true }]}
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AgentFormModal;
