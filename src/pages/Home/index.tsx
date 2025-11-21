import React, { useState } from 'react';
import { Menu, X, BarChart3, Search, Users, Brain, Shield, MessageSquare, Grid3X3 as Grid3X3, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import AgentMarketplace from '../../components/AgentMarketplace.tsx';
import PlatformIntro from '../../components/PlatformIntro.tsx';
import ChatPage from '../../components/ChatPage.tsx';
import AgentChatPage from '../../components/AgentChatPage.tsx';
import LoginPage from '../../components/LoginPage.tsx';
import { useEffect } from 'react';
import { post } from '../../common/axios';


// 热门Agent接口类型定义
interface HotAgentRequest {
  /** 用户名，可选参数，用于个性化推荐 */
  userName?: string;
}

interface HotAgentInfo {
  /** Agent代码，唯一标识 */
  agentCode: string;
  /** Agent名称 */
  agentName: string;
  /** Agent分类 */
  agentCategory: string;
  /** Agent归属 */
  agentBelong: string;
  /** Agent图标 */
  agentIcon: string;
  /** Agent管理员 */
  agentManager: string;
  /** Agent用户 */
  agentUser: string;
  /** Agent描述 */
  agentDescription: string;
  /** Agent提示词 */
  agentPrompt: string;
  /** 创建时间 */
  createTime: number;
  /** 状态，1=可用，0=不可用 */
  status: number;
}

interface HotAgentResponse {
  msg: string;
  data: HotAgentInfo[];
  requestId: string;
  status: number;
}

// 常用Agent接口类型定义
interface FrequentAgentRequest {
  userName: string;
}

interface FrequentAgentResponse {
  status: number;
  msg: string;
  data: FrequentAgentInfo[];
  requestId: string;
}

interface FrequentAgentInfo {
  agentCode: string;
  agentName: string;
  agentCategory: string;
  agentBelong: string;
  agentIcon: string;
  agentManager: string;
  agentUser: string;
  agentDescription: string;
  agentPrompt: string;
  createTime: string;
  id: number;
  updateTime: string;
  status: number;
}

// 全局登录状态管理
const STORAGE_KEYS = {
  IS_LOGGED_IN: 'riskagent_is_logged_in',
  USERNAME: 'riskagent_username'
};

// 获取存储的登录状态
const getStoredLoginState = () => {
  try {
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || '';
    return { isLoggedIn, username };
  } catch (error) {
    return { isLoggedIn: false, username: '' };
  }
};

// 保存登录状态
const saveLoginState = (isLoggedIn: boolean, username: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, isLoggedIn.toString());
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);
  } catch (error) {
    console.warn('无法保存登录状态到本地存储');
  }
};

// 清除登录状态
const clearLoginState = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
  } catch (error) {
    console.warn('无法清除本地存储的登录状态');
  }
};

function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedFeature, setSelectedFeature] = useState('');
  
  // 初始化登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(() => getStoredLoginState().isLoggedIn);
  const [username, setUsername] = useState(() => getStoredLoginState().username);
  
  // 热门Agent相关状态
  const [hotAgents, setHotAgents] = useState<HotAgentInfo[]>([]);
  const [hotAgentsLoading, setHotAgentsLoading] = useState(false);
  const [hotAgentsError, setHotAgentsError] = useState<string | null>(null);

  const [pendingMessage, setPendingMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  // 添加标记用于跟踪从agentChatPage返回的情况
  const [fromAgentChatPage, setFromAgentChatPage] = useState(false);

  // Agent推荐模块默认展开
  const [isAgentSectionExpanded, setIsAgentSectionExpanded] = useState(true);

  // Agent分类Tab状态
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const getData = async() => {
    try {
      const result = await post('/rest/risk/control/manager/dataPlatform/agentList', {
        pageNum: 1,
        pageSize: 50
      });
      console.log(result);
    } catch (error) {
      console.error('请求失败:', error);
      // 这里可以添加用户友好的错误提示
    }
  };
  
  // 获取热门Agent列表
  const fetchHotAgents = async () => {
    setHotAgentsLoading(true);
    setHotAgentsError(null);

    try {
      const requestParams: HotAgentRequest = {};

      // 如果用户已登录，传入用户名以获取个性化推荐
      if (isLoggedIn && username) {
        requestParams.userName = username;
      }

      console.log('获取热门Agent列表，参数:', requestParams);

      const response = await post<HotAgentResponse>('/rest/risk/control/manager/dataPlatform/hotAgentList', requestParams);

      console.log('热门Agent接口返回结果:', response);

      if (response?.status === 0) {
        const agents = response.data || [];
        setHotAgents(agents);
        console.log(`成功获取${agents.length}个热门Agent`);
        return agents; // 返回agents数组供后续使用
      } else {
        throw new Error(response?.msg || '获取热门Agent失败');
      }
    } catch (error: any) {
      console.error('获取热门Agent失败:', error);
      setHotAgentsError(error.message || '网络请求失败，请重试');

      // 失败时使用默认的硬编码Agent作为降级方案
      const fallbackAgents: HotAgentInfo[] = [
        {
          agentCode: 'traffic_analysis',
          agentName: '流量分析',
          agentCategory: '风险感知Agent',
          agentBelong: 'AI部门',
          agentIcon: '',
          agentManager: 'system',
          agentUser: 'system',
          agentDescription: '专业的流量质量case排查助手',
          agentPrompt: '流量分析助手',
          createTime: Date.now(),
          status: 1
        }
      ];
      setHotAgents(fallbackAgents);
      return fallbackAgents; // 返回降级agents数组
    } finally {
      setHotAgentsLoading(false);
    }
  };

  // 获取常用Agent列表的函数
  const fetchFrequentAgents = async (): Promise<FrequentAgentInfo[]> => {
    try {
      // 只有登录用户才能获取常用Agent
      if (!username) {
        console.log('用户未登录，无法获取常用Agent');
        return [];
      }

      const requestParams: FrequentAgentRequest = {
        userName: username
      };

      console.log('获取常用Agent列表，参数:', requestParams);

      const response = await post<FrequentAgentResponse>('/rest/risk/control/manager/dataPlatform/frequentlyAgentList', requestParams);

      console.log('常用Agent接口返回结果:', response);

      if (response?.status === 0) {
        const agents = response.data || [];
        console.log(`成功获取${agents.length}个常用Agent`);
        return agents;
      } else {
        throw new Error(response?.msg || '获取常用Agent失败');
      }
    } catch (error: any) {
      console.error('获取常用Agent失败:', error);
      // 失败时返回空数组，不影响用户体验
      return [];
    }
  };

  // 自动选中第一个Agent的函数
  const autoSelectFirstAgent = async (fromAgentChat: boolean = false) => {
    try {
      const agents = await fetchHotAgents();
      if (agents && agents.length > 0 && (fromAgentChat || !selectedFeature)) {
        const firstAgent = agents[0];

        // 设置选中的功能
        setSelectedFeature(firstAgent.agentName);

        // 设置选中的Agent对象
        const agentObj = {
          id: firstAgent.agentCode,
          name: firstAgent.agentName,
          description: firstAgent.agentDescription,
          category: firstAgent.agentCategory,
          author: firstAgent.agentManager,
          gradient: 'from-blue-400 to-purple-500'
        };

        setSelectedAgent(agentObj);

        console.log('自动选中第一个Agent:', firstAgent.agentName);

        if (fromAgentChat) {
          console.log('从AgentChatPage返回，自动选中Agent成功');
        }
      }
    } catch (error) {
      console.error('自动选中Agent失败:', error);
    }
  };

  useEffect(()=>{
    getData()
    autoSelectFirstAgent() // 获取热门Agent列表并自动选中第一个
  },[])

  // 监听登录状态变化，重新获取热门Agent（获取个性化推荐）
  useEffect(() => {
    autoSelectFirstAgent();
  }, [isLoggedIn, username]);

  // 监听从agentChatPage返回的情况
  useEffect(() => {
    if (fromAgentChatPage) {
      console.log('检测到从AgentChatPage返回，重新加载Agent列表');
      autoSelectFirstAgent(true);
      setFromAgentChatPage(false); // 重置标记
    }
  }, [fromAgentChatPage]);

  // 获取当前选中功能对应的占位符文本
  const getPlaceholderText = () => {
    const placeholderTexts = {
      '流量分析': `同学你好，我是您的流量质量case排查助手，请您按照以下格式输入待排查信息查询对象：

查询对象: XXXXXXXX

对象类型: 账户id/卖家id/作者id  

查询周期: 202508XX-202508XX`,
      '找数据': '找表、找口径、找数据点我，目前还在建设中会的有限，有问题找方炅',
      '政策团组关系': '输入团组申诉工单号或者输入两张执照就可以查询关联关系',
      '分析助手': '你好！我现在只会优质准召分析，其余场景归因覆盖建设中，有问题找方炅'
    };
    return placeholderTexts[selectedFeature as keyof typeof placeholderTexts] || '';
  };

  // 根据Agent信息获取占位符文本
  const getAgentPlaceholderText = (agentName: string) => {
    // 先尝试从预定义的占位符文本中获取
    const predefined = getPlaceholderText();
    if (predefined) return predefined;

    // 如果没有预定义，从热门Agent中找到对应的Agent描述
    const agent = hotAgents.find(a => a.agentName === agentName);
    if (agent && agent.agentDescription) {
      return `您好！我是${agent.agentName}。\n\n${agent.agentDescription}\n\n请告诉我您需要什么帮助？`;
    }

    // 默认占位符
    return `您好！我是${agentName}，请告诉我您需要什么帮助？`;
  };

  // 历史会话管理
  const [historySessions, setHistorySessions] = useState<HistorySession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // 统一的历史会话数据结构
  interface HistorySession {
    id: string;
    title: string;
    agentName: string;
    timestamp: Date;
    isActive: boolean;
    messages: any[];
    type: 'chat' | 'agent-chat'; // 区分普通聊天和Agent聊天
  }

  // 统一的历史会话管理函数
  const createHistorySession = (title: string, agentName: string, type: 'chat' | 'agent-chat' = 'chat') => {
    const newSession: HistorySession = {
      id: `session-${Date.now()}`,
      title: title,
      agentName: agentName,
      timestamp: new Date(),
      isActive: true,
      messages: [],
      type: type
    };
    
    // 将之前的会话设为非活跃状态
    setHistorySessions(prev => [
      newSession,
      ...prev.map(session => ({ ...session, isActive: false }))
    ]);
    
    setCurrentSessionId(newSession.id);
    return newSession;
  };

  // 切换会话
  const switchToSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setHistorySessions(prev => prev.map(session => ({
      ...session,
      isActive: session.id === sessionId
    })));
  };

  // 获取当前活跃会话
  const getCurrentSession = () => {
    return historySessions.find(session => session.isActive);
  };

  // 获取指定类型的历史会话
  const getSessionsByType = (type?: 'chat' | 'agent-chat', agentName?: string) => {
    return historySessions.filter(session => {
      if (type && session.type !== type) return false;
      if (agentName && session.agentName !== agentName) return false;
      return true;
    });
  };

  // 监听Agent切换和登录事件
  useEffect(() => {
    const handleSwitchAgent = (event: CustomEvent) => {
      const targetAgent = event.detail;
      if (!isLoggedIn) {
        setSelectedAgent(targetAgent);
        setCurrentPage('login');
      } else {
        setSelectedAgent(targetAgent);
        setCurrentPage('agent-chat');
      }
    };

    const handleNeedLogin = (event: CustomEvent) => {
      const detail = event.detail || {};
      // 如果有agent信息，保存它
      if (detail.agent) {
        setSelectedAgent(detail.agent);
      }
      // 跳转到登录页
      setCurrentPage('login');
    };

    const handleUserLogout = () => {
      // 处理全局登出
      setIsLoggedIn(false);
      setUsername('');
      clearLoginState();
      setSelectedAgent(null);
      setCurrentPage('home');
      setInputValue('');
    };

    const handleNavigateToAgentMarketplace = () => {
      setCurrentPage('agent-marketplace');
    };

    window.addEventListener('switchAgent', handleSwitchAgent as EventListener);
    window.addEventListener('needLogin', handleNeedLogin as EventListener);
    window.addEventListener('userLogout', handleUserLogout as EventListener);
    window.addEventListener('navigateToAgentMarketplace', handleNavigateToAgentMarketplace as EventListener);

    return () => {
      window.removeEventListener('switchAgent', handleSwitchAgent as EventListener);
      window.removeEventListener('needLogin', handleNeedLogin as EventListener);
      window.removeEventListener('userLogout', handleUserLogout as EventListener);
      window.removeEventListener('navigateToAgentMarketplace', handleNavigateToAgentMarketplace as EventListener);
    };
  }, [isLoggedIn]);

  // 示例问题库
  const exampleQuestions = {
    '流量分析': [
      '分析最近7天的用户流量异常情况',
      '对比本月与上月的流量趋势变化',
      '识别高风险流量来源和特征'
    ],
    '找数据': [
      '查询用户ID为x123456的详细记录',
      '提取最近30天的交易异常数据',
      '导出高风险用户的行为特征数据'
    ],
    '政策团组关系': [
      '分析用户x789012的关联账户网络',
      '识别可疑团伙的组织结构特征',
      '查找与目标用户相关的风险群体'
    ],
    '分析助手': [
      '为什么用户x456789被标记为高风险？',
      '推荐针对当前异常的风控策略',
      '预测下周可能出现的风险趋势'
    ]
  };

  const handleFeaturePillClick = (title: string) => {
    if (title === '更多...') {
      setCurrentPage('agent-marketplace');
      return;
    }
    
    // 设置选中的功能
    setSelectedFeature(title);
    
    // 对于流量分析，设置随机示例问题；其他功能清空输入框
    if (title === '流量分析' && exampleQuestions[title as keyof typeof exampleQuestions]) {
      const questions = exampleQuestions[title as keyof typeof exampleQuestions];
      if (questions) {
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        setInputValue(randomQuestion);
      }
    } else {
      // 对于其他Agent，也可以设置示例问题或清空输入框
      const agent = hotAgents.find(a => a.agentName === title);
      if (agent) {
        // 找到对应的Agent，保存选中状态，准备后续可能的导航到Agent聊天页
        setSelectedAgent({
          id: agent.agentCode,
          name: agent.agentName,
          description: agent.agentDescription,
          category: agent.agentCategory,
          author: agent.agentManager,
          gradient: 'from-blue-400 to-purple-500'
        });
      }
      setInputValue('');
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      if (!isLoggedIn) {
        setPendingMessage(inputValue);
        setCurrentPage('login');
      } else {
        // 确保有选中的Agent，如果没有则自动选择第一个可用的Agent
        let targetAgent = selectedAgent;
        let targetFeature = selectedFeature;

        // 如果没有选中Agent或没有匹配的Agent，自动选择第一个热门Agent
        if (!targetAgent || !targetFeature || targetAgent.name !== targetFeature) {
          if (hotAgents.length > 0) {
            const defaultAgent = hotAgents[0];
            console.log('自动选择默认Agent:', defaultAgent);

            // 转换hotAgent格式为selectedAgent格式
            targetAgent = {
              id: defaultAgent.agentCode,
              name: defaultAgent.agentName,
              description: defaultAgent.agentDescription,
              category: defaultAgent.agentCategory,
              author: defaultAgent.agentManager,
              gradient: 'from-blue-400 to-purple-500'
            };

            targetFeature = defaultAgent.agentName;

            // 更新状态
            setSelectedAgent(targetAgent);
            setSelectedFeature(targetFeature);

            console.log('设置默认Agent成功:', targetAgent);
          }
        }

        // 无论如何都跳转到Agent聊天页
        setCurrentPage('agent-chat');
      }
    }
  };

  const handleLogin = async (loginUsername: string) => {
    setIsLoggedIn(true);
    setUsername(loginUsername);
    
    // 保存登录状态到本地存储
    saveLoginState(true, loginUsername);
    
    // 恢复用户的待发送消息到输入框
    if (pendingMessage) {
      setInputValue(pendingMessage);
      setPendingMessage('');
    }

    // 确保有Agent选择，如果没有则自动选择第一个可用Agent
    let targetAgent = selectedAgent;

    if (!targetAgent) {
      console.log('登录时没有选中Agent，尝试自动选择...');
      try {
        // 如果hotAgents已有数据，直接使用
        if (hotAgents && hotAgents.length > 0) {
          const defaultAgent = hotAgents[0];
          targetAgent = {
            id: defaultAgent.agentCode,
            name: defaultAgent.agentName,
            description: defaultAgent.agentDescription,
            category: defaultAgent.agentCategory,
            author: defaultAgent.agentManager,
            gradient: 'from-blue-400 to-purple-500'
          };
          setSelectedAgent(targetAgent);
          setSelectedFeature(defaultAgent.agentName);
          console.log('登录时自动选中Agent成功:', targetAgent);
        } else {
          // 如果没有现有数据，等待获取Agent数据
          await autoSelectFirstAgent();
          targetAgent = selectedAgent;
        }
      } catch (error) {
        console.error('登录时自动选择Agent失败:', error);
        // 使用降级方案
        targetAgent = {
          id: 'default_agent',
          name: '智能助手',
          description: '通用智能助手，为您提供各种帮助',
          category: '通用助手',
          author: 'system',
          gradient: 'from-blue-400 to-purple-500'
        };
        setSelectedAgent(targetAgent);
        setSelectedFeature('智能助手');
        console.log('使用降级Agent:', targetAgent);
      }
    }

    // 统一跳转到agent-chat页面
    if (targetAgent || selectedAgent) {
      setCurrentPage('agent-chat');
    } else {
      // 极端情况的兜底处理：如果仍然没有Agent，跳转回首页
      console.warn('登录后仍无法获取Agent，返回首页');
      setCurrentPage('chat');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    
    // 清除本地存储的登录状态
    clearLoginState();
    
    setSelectedAgent(null);
    setCurrentPage('home');
    setInputValue('');
  };

  const handleBackToHome = () => {
    // 检查当前是否从agentChatPage返回
    const wasInAgentChat = currentPage === 'agent-chat';

    setCurrentPage('home');
    setSelectedAgent(null);
    if (!pendingMessage) {
      setInputValue('');
    }

    // 如果从agentChatPage返回，设置标记以触发自动选中
    if (wasInAgentChat) {
      setFromAgentChatPage(true);
    }
  };

  if (currentPage === 'agent-marketplace') {
    return (
      <AgentMarketplace 
        onBack={handleBackToHome} 
        historySessions={historySessions}
        onSessionSwitch={switchToSession}
        onStartAgent={(agent) => {
          if (!isLoggedIn) {
            setSelectedAgent(agent);
            setCurrentPage('login');
          } else {
            setSelectedAgent(agent);
            setCurrentPage('agent-chat');
          }
        }}
      />
    );
  }

  if (currentPage === 'platform-intro') {
    return <PlatformIntro onBack={handleBackToHome} />;
  }

  if (currentPage === 'login') {
    return (
      <LoginPage 
        onBack={handleBackToHome}
        onLogin={handleLogin}
        redirectMessage={pendingMessage ? '请先登录以继续您的对话' : selectedAgent ? '请先登录以使用Agent' : undefined}
      />
    );
  }

  if (currentPage === 'chat') {
    return (
      <ChatPage 
        onBack={handleBackToHome} 
        initialMessage={inputValue}
        username={username}
        onLogout={handleLogout}
        historySessions={historySessions}
        onSessionSwitch={switchToSession}
        onCreateHistorySession={(title, agentName) => createHistorySession(title, agentName, 'chat')}
      />
    );
  }

  if (currentPage === 'agent-chat' && selectedAgent) {
    return (
      <AgentChatPage 
        onBack={handleBackToHome} 
        agent={selectedAgent}
        username={username}
        onLogout={handleLogout}
        onCreateHistorySession={(title, agentName) => createHistorySession(title, agentName, 'agent-chat')}
        historySessions={getSessionsByType('agent-chat', selectedAgent.name)}
        onSessionSwitch={switchToSession}
        initialMessage={inputValue}
        onMessageSent={() => setInputValue('')}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative flex flex-col">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://p4-ad.adkwai.com/udata/pkg/ks-ad-fe/riskagentBG.png"
          alt="background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col flex-1">
      {/* Navigation */}
      <nav className="bg-transparent border-b border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <img src="https://p4-ad.adkwai.com/udata/pkg/ks-ad-fe/Vector.png" alt="RiskAgent Logo" className="w-10 h-10" />
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">RiskAgent</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button 
                  onClick={() => setCurrentPage('agent-marketplace')}
                  className="text-gray-300 hover:text-blue-400 text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  Agent广场
                </button>
                <button 
                  onClick={() => setCurrentPage('platform-intro')}
                  className="text-gray-300 hover:text-blue-400 text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  平台介绍
                </button>
                {isLoggedIn ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-300">欢迎，{username}</span>
                    <button 
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      退出登录
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setCurrentPage('login')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    登录
                  </button>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-blue-400 p-2 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
                <button 
                  onClick={() => {
                    setCurrentPage('agent-marketplace');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-blue-400 block px-3 py-2 rounded-lg text-base font-medium w-full text-left transition-colors"
                >
                  Agent广场
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage('platform-intro');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-blue-400 block px-3 py-2 rounded-lg text-base font-medium w-full text-left transition-colors"
                >
                  平台介绍
                </button>
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-gray-300 text-base">欢迎，{username}</div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-2 rounded-lg text-base font-medium transition-all"
                    >
                      退出登录
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setCurrentPage('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 rounded-lg text-base font-medium transition-all"
                  >
                    登录
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent mb-8 tracking-tight relative leading-tight pb-2">
            Welcome To RiskAgent
          </h1>
          <p className="text-xl text-gray-300 mb-16 font-medium">
            风控不再复杂，用对话驱动决策
          </p>

          {/* AI Assistant Message */}
          <div className="max-w-4xl mx-auto mb-12">
            {/* ChatGPT Style Input Area */}
            <div className="relative bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-end p-4 space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-transparent border-none resize-none outline-none text-gray-100 placeholder-gray-400 text-sm leading-6 h-40 py-2 font-medium transition-all duration-200 overflow-y-auto text-left"
                    rows={1}
                    placeholder={selectedFeature ? getAgentPlaceholderText(selectedFeature) : '请选择一个Agent或输入您的问题...'}
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      height: '160px',
                      textAlign: 'left',
                      paddingLeft: '0px'
                    }}
                  />
                  <style jsx>{`
                   textarea::-webkit-scrollbar {
                      width: 6px;
                    }
                    textarea::-webkit-scrollbar-track {
                      background: transparent;
                    }
                    textarea::-webkit-scrollbar-thumb {
                      background: #6b7280;
                      border-radius: 3px;
                    }
                    textarea::-webkit-scrollbar-thumb:hover {
                      background: #9ca3af;
                    }
                  `}</style>
                </div>
                <button
                  onClick={handleSendMessage}
                  className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full transition-all duration-200 hover:scale-105 shadow-lg self-end"
                >
                  <span className="text-white text-sm font-semibold">发送</span>
                </button>
              </div>
            </div>
          </div>

          {/* Agent功能选择按钮 */}
          <div className="mb-8">
            {hotAgentsLoading ? (
              <div className="flex items-center justify-center space-x-2 text-gray-400 mb-6">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">加载Agent功能中...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Agent功能切换按钮 */}
                <div className="flex flex-wrap justify-center gap-3">
                  {hotAgents.slice(0, 6).map((agent) => (
                    <button
                      key={agent.agentCode}
                      onClick={() => {
                        setSelectedFeature(agent.agentName);
                        const agentObj = {
                          id: agent.agentCode,
                          name: agent.agentName,
                          description: agent.agentDescription,
                          category: agent.agentCategory,
                          author: agent.agentManager,
                          gradient: 'from-blue-400 to-purple-500'
                        };
                        setSelectedAgent(agentObj);
                      }}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                        selectedFeature === agent.agentName
                          ? 'bg-gradient-to-r from-blue-600/90 to-blue-700/90 text-white shadow-lg shadow-blue-500/50 scale-105 border border-blue-400/50'
                          : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80 hover:text-white hover:scale-105 border border-gray-600/50'
                      }`}
                    >
                      {agent.agentName}
                    </button>
                  ))}
                  <button
                    onClick={() => handleFeaturePillClick('更多...')}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 bg-gray-700/80 text-gray-300 hover:bg-gray-600/80 hover:text-white hover:scale-105 border border-gray-600/50"
                  >
                    更多...
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Agent推荐模块 - 透明背景 */}
      <section className="relative px-4 sm:px-6 lg:px-8 mt-0 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* 标题栏 - 左对齐布局 */}
          <div className="mb-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* 左侧：图标+标题 */}
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-100">热门 Agent</h2>
              </div>

              {/* 右侧：分类Tab + 探索更多链接 */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* 分类Tab */}
                <div className="flex flex-wrap gap-2">
                  {['全部', ...Array.from(new Set(hotAgents.map(a => a.agentCategory)))].map((category) => {
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category
                            ? 'bg-blue-600/30 text-blue-300 border border-blue-500/60 shadow-lg shadow-blue-500/25'
                            : 'bg-gray-800/60 text-gray-300 border border-gray-600/50 hover:bg-gray-700/80 hover:text-gray-200 hover:border-gray-500/60'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                {/* 探索更多链接 - 炫酷版本 */}
                <button
                  onClick={() => handleFeaturePillClick('更多...')}
                  className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105"
                >
                  {/* 背景渐变层 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* 动态边框 */}
                  <div className="absolute inset-0 border border-blue-500/0 group-hover:border-blue-500/60 rounded-lg transition-all duration-300"></div>

                  {/* 扫光效果 */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                  <span className="text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors duration-300 relative z-10">探索更多</span>
                  <ChevronDown className="h-4 w-4 text-blue-400 group-hover:text-blue-300 rotate-[-90deg] transition-all duration-300 group-hover:translate-x-1 relative z-10" />
                </button>
              </div>
            </div>
          </div>

          {/* Agent卡片列表 - 两行展示 + 渐变阴影 */}
          <div className="relative">
            {hotAgentsLoading ? (
                <div className="flex items-center justify-center space-x-2 text-gray-400 py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="text-sm">加载热门Agent中...</span>
                </div>
              ) : hotAgentsError ? (
                <div className="flex flex-col items-center space-y-3 py-8">
                  <span className="text-red-400 text-sm">加载失败: {hotAgentsError}</span>
                  <button
                    onClick={fetchHotAgents}
                    className="text-blue-400 hover:text-blue-300 text-xs underline"
                  >
                    重试
                  </button>
                </div>
              ) : (
                <>
                  {/* 卡片网格 - 只显示6个（两行） */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative">
                    {hotAgents
                      .filter(agent => selectedCategory === '全部' || agent.agentCategory === selectedCategory)
                      .slice(0, 6)
                      .map((agent) => (
                      <AgentCard
                        key={agent.agentCode}
                        agent={agent}
                        isSelected={false}
                        onClick={() => {
                          const agentObj = {
                            id: agent.agentCode,
                            name: agent.agentName,
                            description: agent.agentDescription,
                            category: agent.agentCategory,
                            author: agent.agentManager,
                            gradient: 'from-blue-400 to-purple-500'
                          };
                          setSelectedAgent(agentObj);
                          setCurrentPage('agentChatPage');
                        }}
                      />
                    ))}
                  </div>

                  {/* 渐变阴影效果 - 暗示更多内容 */}
                  {hotAgents.filter(agent => selectedCategory === '全部' || agent.agentCategory === selectedCategory).length > 6 && (
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent pointer-events-none"></div>
                  )}
                </>
              )}
          </div>

          {/* 探索更多按钮 - 页面底部右侧 */}
          {!hotAgentsLoading && !hotAgentsError && hotAgents.filter(agent => selectedCategory === '全部' || agent.agentCategory === selectedCategory).length > 6 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => handleFeaturePillClick('更多...')}
                className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 bg-gray-800/80 backdrop-blur-md border border-gray-700/60 hover:border-blue-500/60 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/30"
              >
                <Grid3X3 className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                <span className="text-base font-semibold text-gray-300 group-hover:text-white transition-colors duration-300">
                  探索更多 Agent
                </span>
                <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-blue-400 rotate-[-90deg] transition-all duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}

// 根据Agent分类获取默认图标
function getDefaultIcon(category: string, size: string = 'h-4 w-4'): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    '风险感知Agent': <Shield className={size} />,
    '风险归因Agent': <Search className={size} />,
    '风险识别Agent': <BarChart3 className={size} />,
    '数据Agent': <Brain className={size} />,
    '通用助手': <MessageSquare className={size} />,
    '编程助手': <Grid3X3 className={size} />,
    '内容创作': <Users className={size} />
  };

  return iconMap[category] || <Brain className={size} />;
}

// Agent卡片组件
interface AgentCardProps {
  agent: HotAgentInfo;
  isSelected: boolean;
  onClick: () => void;
}

function AgentCard({ agent, isSelected, onClick }: AgentCardProps) {
  // 获取渐变色
  const gradientColors = [
    'from-blue-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600',
    'from-cyan-500 to-blue-600',
  ];

  const gradientIndex = agent.agentCode.charCodeAt(0) % gradientColors.length;
  const gradient = gradientColors[gradientIndex];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-gray-800/50 backdrop-blur-sm border-2 rounded-xl cursor-pointer transition-all duration-500 overflow-hidden ${
        isSelected
          ? 'border-blue-500 bg-blue-500/5 shadow-2xl shadow-blue-500/30 scale-[1.03]'
          : 'border-gray-700/50 hover:border-blue-400/60 hover:bg-gray-800/80 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20'
      }`}
    >


      {/* 卡片内容 - 横向布局，固定高度 */}
      <div className="p-6 flex items-start gap-6 h-[180px] relative z-10">
        {/* 图标 */}
        <div className="flex-shrink-0">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg transition-all duration-500 ${
            isSelected ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-2xl'
          }`}>
            <div className="text-white transition-transform duration-500 group-hover:scale-110">
              {getDefaultIcon(agent.agentCategory, 'h-8 w-8')}
            </div>
          </div>
        </div>

        {/* 文本内容 - 固定布局 */}
        <div className="flex-1 min-w-0 flex flex-col h-full">
          {/* Agent名称 */}
          <h3 className={`text-xl font-bold mb-2 transition-all duration-300 ${
            isSelected ? 'text-blue-400' : 'text-gray-100 group-hover:text-blue-300'
          }`}>
            {agent.agentName}
          </h3>

          {/* Agent描述 - 固定两行高度 */}
          <p className="text-sm text-gray-400 group-hover:text-gray-100 leading-relaxed mb-3 h-[40px] overflow-hidden transition-colors duration-300" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis'
          }}>
            {agent.agentDescription}
          </p>

          {/* 底部标签和按钮 - 固定在底部 */}
          <div className="flex items-center justify-between gap-3 mt-auto">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-300 ${
                isSelected
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600/30 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/30'
              }`}>
                {agent.agentCategory}
              </span>
              <span className={`inline-flex items-center space-x-1.5 text-xs transition-colors duration-300 ${
                isSelected ? 'text-gray-400' : 'text-gray-500 group-hover:text-gray-400'
              }`}>
                <Users className="h-3.5 w-3.5" />
                <span>{agent.agentBelong}</span>
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="group/btn relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
              <span>进入对话</span>
              <ArrowLeft className="h-3.5 w-3.5 transform rotate-180 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>

      {/* 选中状态指示器 */}
      {isSelected && (
        <div className="absolute top-4 right-4 z-20">
          <div className="relative">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
