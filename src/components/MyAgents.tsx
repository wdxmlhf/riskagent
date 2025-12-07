import React, { useState, useEffect } from 'react';
import { Tabs, ConfigProvider } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import AgentDataMonitoring from './MyAgents/AgentDataMonitoring';
import AgentManagement from './MyAgents/AgentManagement';
import AgentCapabilities from './MyAgents/AgentCapabilities';

const STORAGE_KEYS = {
  IS_LOGGED_IN: 'riskagent_isLoggedIn',
  USERNAME: 'riskagent_username'
};

const getStoredLoginState = () => {
  try {
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || '';
    return { isLoggedIn, username };
  } catch (error) {
    return { isLoggedIn: false, username: '' };
  }
};

const MyAgents: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('1');
  const [isLoggedIn, setIsLoggedIn] = useState(() => getStoredLoginState().isLoggedIn);
  const [username, setUsername] = useState(() => getStoredLoginState().username);

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

  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
      localStorage.removeItem(STORAGE_KEYS.USERNAME);
      setIsLoggedIn(false);
      setUsername('');
      navigate('/');
    } catch (error) {
      console.error('退出登录失败', error);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative flex flex-col">
      <div className="fixed inset-0 z-0">
        <img
          src="https://p4-ad.adkwai.com/udata/pkg/ks-ad-fe/riskagentBG.png"
          alt="background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <AppNavbar
          isLoggedIn={isLoggedIn}
          username={username}
          onLogout={handleLogout}
        />

        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">我的 Agent</h1>
              <p className="text-gray-400">管理您创建的 Agent 及其数据</p>
            </div>

            <ConfigProvider
              theme={{
                components: {
                  Tabs: {
                    colorBgContainer: 'transparent',
                    colorText: '#e5e7eb',
                    colorTextHeading: '#ffffff',
                    colorPrimary: '#3b82f6',
                    colorBorder: 'rgba(75, 85, 99, 0.3)',
                  },
                  Table: {
                    colorBgContainer: 'rgba(31, 41, 55, 0.5)',
                    colorText: '#e5e7eb',
                    colorTextHeading: '#ffffff',
                    colorBorder: 'rgba(75, 85, 99, 0.3)',
                    colorBorderSecondary: 'rgba(75, 85, 99, 0.2)',
                  },
                  Select: {
                    colorBgContainer: 'rgba(31, 41, 55, 0.8)',
                    colorText: '#e5e7eb',
                    colorBorder: 'rgba(75, 85, 99, 0.5)',
                    colorTextPlaceholder: '#9ca3af',
                  },
                  DatePicker: {
                    colorBgContainer: 'rgba(31, 41, 55, 0.8)',
                    colorText: '#e5e7eb',
                    colorBorder: 'rgba(75, 85, 99, 0.5)',
                    colorTextPlaceholder: '#9ca3af',
                  },
                  Button: {
                    colorBgContainer: 'rgba(31, 41, 55, 0.8)',
                    colorText: '#e5e7eb',
                    colorPrimary: '#3b82f6',
                  },
                  Card: {
                    colorBgContainer: 'rgba(31, 41, 55, 0.5)',
                    colorText: '#e5e7eb',
                    colorBorder: 'rgba(75, 85, 99, 0.3)',
                  },
                },
              }}
            >
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
                <Tabs
                  activeKey={activeTab}
                  onChange={handleTabChange}
                  items={tabItems}
                  className="my-agents-tabs"
                />
              </div>
            </ConfigProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAgents;
