import React, { useState, useEffect } from 'react';
import { Table, Select, DatePicker, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import axios from '../../common/axios';

const { RangePicker } = DatePicker;

interface AgentStats {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_code: string;
  week_start_date: string;
  unique_users: number;
  conversation_count: number;
  task_trigger_count: number;
  feedback_count: number;
  satisfaction_rate: number;
}

interface Agent {
  id: string;
  agent_code: string;
  agent_name: string;
}

const AgentDataMonitoring: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<AgentStats[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  useEffect(() => {
    fetchAgents();
    fetchStats();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data } = await axios.get('/api/my-agents/list');
      setAgents(data);
    } catch (error) {
      message.error('获取 Agent 列表失败');
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedAgent) {
        params.agent_id = selectedAgent;
      }
      if (dateRange) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }

      const { data } = await axios.get('/api/my-agents/stats', { params });
      setStatsData(data);
    } catch (error) {
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchStats();
  };

  const handleReset = () => {
    setSelectedAgent(undefined);
    setDateRange(null);
    setTimeout(() => fetchStats(), 100);
  };

  const columns = [
    {
      title: 'Agent 名称',
      dataIndex: 'agent_name',
      key: 'agent_name',
      render: (text: string, record: AgentStats) => (
        <Button
          type="link"
          onClick={() => navigate(`/my-agents/${record.agent_id}`)}
          className="text-blue-400 hover:text-blue-300 p-0"
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Agent 标识',
      dataIndex: 'agent_code',
      key: 'agent_code',
    },
    {
      title: '统计周',
      dataIndex: 'week_start_date',
      key: 'week_start_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '本周使用用户数',
      dataIndex: 'unique_users',
      key: 'unique_users',
      sorter: (a: AgentStats, b: AgentStats) => a.unique_users - b.unique_users,
    },
    {
      title: '本周对话次数',
      dataIndex: 'conversation_count',
      key: 'conversation_count',
      sorter: (a: AgentStats, b: AgentStats) => a.conversation_count - b.conversation_count,
    },
    {
      title: '本周任务触发数',
      dataIndex: 'task_trigger_count',
      key: 'task_trigger_count',
      sorter: (a: AgentStats, b: AgentStats) => a.task_trigger_count - b.task_trigger_count,
    },
    {
      title: '反馈数',
      dataIndex: 'feedback_count',
      key: 'feedback_count',
      sorter: (a: AgentStats, b: AgentStats) => a.feedback_count - b.feedback_count,
    },
    {
      title: '满意率',
      dataIndex: 'satisfaction_rate',
      key: 'satisfaction_rate',
      render: (rate: number) => `${rate.toFixed(2)}%`,
      sorter: (a: AgentStats, b: AgentStats) => a.satisfaction_rate - b.satisfaction_rate,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center flex-wrap">
        <Select
          placeholder="选择 Agent"
          style={{ width: 200 }}
          value={selectedAgent}
          onChange={setSelectedAgent}
          allowClear
          options={agents.map(agent => ({
            label: agent.agent_name,
            value: agent.id,
          }))}
        />

        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
          style={{ width: 300 }}
        />

        <Button type="primary" onClick={handleFilter}>
          筛选
        </Button>

        <Button onClick={handleReset}>
          重置
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={statsData}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />
    </div>
  );
};

export default AgentDataMonitoring;
