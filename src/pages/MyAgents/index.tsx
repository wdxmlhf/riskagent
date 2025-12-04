import React, { useState, useEffect } from 'react';
import { Button, Table, Space, message, Modal, Drawer, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { supabase, MyAgent } from '@/lib/supabase';
import AgentFormModal from '@/components/AgentFormModal';
import ScheduledTasksDrawer from '@/components/ScheduledTasksDrawer';

const MyAgents: React.FC = () => {
  const [agents, setAgents] = useState<MyAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingAgent, setEditingAgent] = useState<MyAgent | null>(null);
  const [tasksDrawerVisible, setTasksDrawerVisible] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('my_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error: any) {
      message.error('获取Agent列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAgent(null);
    setFormVisible(true);
  };

  const handleEdit = (agent: MyAgent) => {
    setEditingAgent(agent);
    setFormVisible(true);
  };

  const handleDelete = (agent: MyAgent) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除Agent "${agent.agent_name}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('my_agents')
            .delete()
            .eq('id', agent.id);

          if (error) throw error;
          message.success('删除成功');
          fetchAgents();
        } catch (error: any) {
          message.error('删除失败: ' + error.message);
        }
      },
    });
  };

  const handleManageTasks = (agentId: string) => {
    setSelectedAgentId(agentId);
    setTasksDrawerVisible(true);
  };

  const columns = [
    {
      title: 'Agent代码',
      dataIndex: 'agent_code',
      key: 'agent_code',
      width: 120,
    },
    {
      title: 'Agent名称',
      dataIndex: 'agent_name',
      key: 'agent_name',
      width: 150,
    },
    {
      title: '分类',
      dataIndex: 'agent_category',
      key: 'agent_category',
      width: 120,
    },
    {
      title: '归属',
      dataIndex: 'agent_belong',
      key: 'agent_belong',
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'agent_description',
      key: 'agent_description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>{status ? '是' : '否'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: MyAgent) => (
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
            size="small"
            icon={<SettingOutlined />}
            onClick={() => handleManageTasks(record.id)}
          >
            定时任务
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
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">我的Agent</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建Agent
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={agents}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <AgentFormModal
        visible={formVisible}
        agent={editingAgent}
        onClose={() => {
          setFormVisible(false);
          setEditingAgent(null);
        }}
        onSuccess={() => {
          setFormVisible(false);
          setEditingAgent(null);
          fetchAgents();
        }}
      />

      <ScheduledTasksDrawer
        visible={tasksDrawerVisible}
        agentId={selectedAgentId}
        onClose={() => {
          setTasksDrawerVisible(false);
          setSelectedAgentId(null);
        }}
      />
    </div>
  );
};

export default MyAgents;
