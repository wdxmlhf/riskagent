import React, { useState, useEffect } from 'react';
import { Card, Button, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../../common/axios';
import CreateAgentModal from './CreateAgentModal';

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
  created_at: string;
}

const AgentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/my-agents/list');
      setAgents(data);
    } catch (error) {
      message.error('获取 Agent 列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAgent(null);
    setModalVisible(true);
  };

  const handleEdit = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAgent(agent);
    setModalVisible(true);
  };

  const handleDelete = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除这个 Agent 吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await axios.delete(`/api/my-agents/${agentId}`);
          message.success('删除成功');
          fetchAgents();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    fetchAgents();
  };

  const handleCardClick = (agentId: string) => {
    navigate(`/my-agents/${agentId}`);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Card
          hoverable
          onClick={handleCreate}
          className="h-64 flex items-center justify-center bg-gray-700/30 border-dashed border-2 border-gray-600 cursor-pointer hover:border-blue-500 transition-all"
        >
          <div className="text-center">
            <PlusOutlined className="text-4xl text-gray-400 mb-2" />
            <p className="text-gray-300 text-lg">创建 Agent</p>
          </div>
        </Card>

        {agents.map((agent) => (
          <Card
            key={agent.id}
            hoverable
            onClick={() => handleCardClick(agent.id)}
            className="h-64 bg-gray-700/30 border border-gray-600 hover:border-blue-500 transition-all cursor-pointer"
            actions={[
              <Button
                key="edit"
                type="text"
                icon={<EditOutlined />}
                onClick={(e) => handleEdit(agent, e)}
                className="text-blue-400 hover:text-blue-300"
              >
                编辑
              </Button>,
              <Button
                key="delete"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => handleDelete(agent.id, e)}
              >
                删除
              </Button>,
            ]}
          >
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white truncate flex-1">
                  {agent.agent_name}
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    agent.status
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {agent.status ? '公开' : '私有'}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-2">
                标识: <span className="text-gray-300">{agent.agent_code}</span>
              </p>

              <p className="text-sm text-gray-400 mb-2">
                分类: <span className="text-gray-300">{agent.agent_category}</span>
              </p>

              {agent.agent_belong && (
                <p className="text-sm text-gray-400 mb-2">
                  团队: <span className="text-gray-300">{agent.agent_belong}</span>
                </p>
              )}

              <p className="text-sm text-gray-300 line-clamp-3 flex-1">
                {agent.agent_description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <CreateAgentModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
        editingAgent={editingAgent}
      />
    </div>
  );
};

export default AgentManagement;
