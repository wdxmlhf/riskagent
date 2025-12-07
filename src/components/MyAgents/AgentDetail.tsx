import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Tag, message, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
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
  updated_at: string;
}

interface AgentTask {
  id: string;
  task_name: string;
  frequency: string;
  group_chat_numbers: string[];
  is_active: boolean;
}

const AgentDetail: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchAgentDetail();
    fetchAgentTasks();
  }, [agentId]);

  const fetchAgentDetail = async () => {
    if (!agentId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/my-agents/${agentId}`);
      setAgent(data);
    } catch (error) {
      message.error('获取 Agent 详情失败');
      navigate('/my-agents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentTasks = async () => {
    if (!agentId) return;
    try {
      const { data } = await axios.get(`/api/my-agents/tasks?agent_id=${agentId}`);
      setTasks(data);
    } catch (error) {
      console.error('获取任务列表失败', error);
    }
  };

  const handleBack = () => {
    navigate('/my-agents');
  };

  const handleEdit = () => {
    setModalVisible(true);
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    fetchAgentDetail();
  };

  const handleNavigateToTasks = () => {
    navigate('/my-agents?tab=3');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  const frequencyMap: Record<string, string> = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="text-gray-300"
          >
            返回
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            编辑 Agent
          </Button>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">{agent.agent_name}</h1>
            <Tag color={agent.status ? 'green' : 'default'}>
              {agent.status ? '公开' : '私有'}
            </Tag>
          </div>

          <Descriptions column={2} className="text-gray-300">
            <Descriptions.Item label="Agent 标识">
              <span className="text-gray-100">{agent.agent_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Agent 分类">
              <span className="text-gray-100">{agent.agent_category}</span>
            </Descriptions.Item>
            {agent.agent_belong && (
              <Descriptions.Item label="所属团队">
                <span className="text-gray-100">{agent.agent_belong}</span>
              </Descriptions.Item>
            )}
            {agent.agent_manager && (
              <Descriptions.Item label="负责人">
                <span className="text-gray-100">{agent.agent_manager}</span>
              </Descriptions.Item>
            )}
            {agent.agent_user && (
              <Descriptions.Item label="使用对象">
                <span className="text-gray-100">{agent.agent_user}</span>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="简介" span={2}>
              <span className="text-gray-100">{agent.agent_description}</span>
            </Descriptions.Item>
            <Descriptions.Item label="系统 Prompt" span={2}>
              <span className="text-gray-100">{agent.agent_prompt}</span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50"
          title={<span className="text-white">已启用的功能</span>}
        >
          {tasks.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">定时任务</h3>
                <Button type="link" onClick={handleNavigateToTasks}>
                  管理所有任务
                </Button>
              </div>
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  size="small"
                  className="bg-gray-700/30 border border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-medium">{task.task_name}</span>
                        <Tag color={task.is_active ? 'green' : 'default'}>
                          {task.is_active ? '已启用' : '已停用'}
                        </Tag>
                      </div>
                      <div className="text-sm text-gray-400">
                        执行频率: {frequencyMap[task.frequency] || task.frequency}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        接入群聊: {task.group_chat_numbers.join(', ') || '未设置'}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>暂无启用的功能</p>
              <Button type="link" onClick={handleNavigateToTasks} className="mt-2">
                去配置定时任务
              </Button>
            </div>
          )}
        </Card>
      </div>

      {agent && (
        <CreateAgentModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSuccess={handleModalSuccess}
          editingAgent={agent}
        />
      )}
    </div>
  );
};

export default AgentDetail;
