import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { useSearchParams } from 'react-router-dom';
import AgentDataMonitoring from './MyAgents/AgentDataMonitoring';
import AgentManagement from './MyAgents/AgentManagement';
import AgentCapabilities from './MyAgents/AgentCapabilities';

const MyAgents: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['1', '2', '3'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  const tabItems = [
    {
      key: '1',
      label: '数据监控',
      children: <AgentDataMonitoring />,
    },
    {
      key: '2',
      label: 'Agent 管理',
      children: <AgentManagement />,
    },
    {
      key: '3',
      label: 'Agent 功能',
      children: <AgentCapabilities />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">我的 Agent</h1>
          <p className="text-gray-400">管理您创建的 Agent 及其数据</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            className="my-agents-tabs"
          />
        </div>
      </div>
    </div>
  );
};

export default MyAgents;
