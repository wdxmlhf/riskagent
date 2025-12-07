import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Grid3x3 as Grid3X3, Shield, Search, Menu, X, Layout, MoreVertical, Trash2, Edit2, Link2, Check, AlertCircle, CheckCircle, User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { post } from '../common/axios';

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

interface AgentMarketplaceProps {
  onBack: () => void;
  onStartAgent?: (agent: AgentCard) => void;
  // 暂时注释掉历史会话功能 - historySessions?: HistorySession[];
  // 暂时注释掉历史会话功能 - onSessionSwitch?: (sessionId: string) => void;
}

// 暂时注释掉历史会话接口定义
// 暂时注释掉历史会话接口定义
interface HistorySession {
  id: string;
  title: string;
  agentName: string;
  timestamp: Date;
  isActive: boolean;
  messages: any[];
  type: 'chat' | 'agent-chat';
}

// 定义分类配置，支持code和显示名称
interface CategoryConfig {
  code: string;
  displayName: string;
}

// 更新分类配置
const categoryConfigs: CategoryConfig[] = [
  { code: 'all', displayName: '全部' },
  { code: 'riskAware', displayName: '风险感知Agent' },
  { code: 'riskAttribution', displayName: '风险归因Agent' },
  { code: 'riskIdentify', displayName: '风险识别Agent' },
  { code: 'riskData', displayName: '数据Agent' }
];

// Agent卡片接口定义
interface AgentCard {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  gradient: string;
  status?: number;
}

// 增加missing interface定义
interface AgentDataItem {
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

// 接口请求参数类型定义
interface AgentListRequest {
  agent_code: string;
  agent_name: string;
  agent_category: string;
  agent_belong: string;
  agent_icon: string;
  agent_manager: string;
  agent_user: string;
  agent_description: string;
  agent_prompt: string;
  create_time: string;
  page_num: number;
  page_size: number;
  total: number;
  user_name: string;
}

// 常用Agent请求参数类型定义
interface FrequentAgentRequest {
  userName: string;
}

// 常用Agent响应类型定义
interface FrequentAgentResponse {
  status: number;
  msg: string;
  data: AgentInfo[];
  requestId: string;
}

// 常用Agent信息类型定义（与接口文档保持一致）
interface AgentInfo {
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
  status: number; // 1=可用，0=不可用
}

// 渐变色配置数组
const gradientColors = [
  'from-pink-400 to-purple-500',
  'from-blue-400 to-purple-500',
  'from-green-400 to-teal-500',
  'from-orange-400 to-red-500',
  'from-cyan-400 to-blue-500',
  'from-indigo-400 to-violet-500',
  'from-purple-400 to-pink-500',
  'from-teal-400 to-green-500',
  'from-red-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-purple-500',
  'from-lime-400 to-green-500',
  'from-sky-400 to-blue-500',
  'from-fuchsia-400 to-pink-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-red-500',
  'from-yellow-400 to-orange-500'
];

// 生成渐变色的函数
const generateGradient = (index: number): string => {
  return gradientColors[index % gradientColors.length];
};

// 转换后端数据为前端AgentCard格式
const transformAgentData = (agentItems: AgentDataItem[]): AgentCard[] => {
  return agentItems.map((item, index) => ({
    id: item.agentCode,
    name: item.agentName,
    description: item.agentDescription || '暂无描述',
    category: item.agentCategory,
    author: item.agentBelong || '未知',
    gradient: generateGradient(index),
    status: item.status
  }));
};

export default function AgentMarketplace({ onBack, onStartAgent }: AgentMarketplaceProps) {
  const navigate = useNavigate();

  // 获取分类显示名称的函数
  const getCategoryDisplayName = (code: string) => {
    const config = categoryConfigs.find(c => c.code === code);
    return config ? config.displayName : code;
  };

  // 暂时注释掉分类code函数
  // 暂时注释掉分类code函数
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // API数据状态管理
  const [agentData, setAgentData] = useState<AgentCard[]>([]);
  const [loading, setLoading] = useState(false);

  // 分页信息状态（为将来的分页功能做准备）
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 20
  });

  // 搜索功能状态
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 常用Agent状态管理
  const [frequentAgents, setFrequentAgents] = useState<AgentCard[]>([]);
  const [frequentAgentsLoading, setFrequentAgentsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Tab栏吸顶状态
  const [isTabSticky, setIsTabSticky] = useState(false);
  const tabBarRef = React.useRef<HTMLDivElement>(null);
  const tabBarPlaceholderRef = React.useRef<HTMLDivElement>(null);

  // 暂时注释掉历史会话操作状态
  // 暂时注释掉历史会话操作状态
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 获取当前登录状态
  const { isLoggedIn, username } = getStoredLoginState();

  // 添加防重复调用标志
  const [isInitialized, setIsInitialized] = useState(false);

  // 添加搜索框清空检测状态
  const [previousSearchQuery, setPreviousSearchQuery] = useState('');

  // 分页配置
  const itemsPerPage = 20;

  // 调用常用Agent接口的函数
  const fetchFrequentAgents = async () => {
    // 只有登录用户才获取常用Agent
    if (!isLoggedIn || !username) {
      setFrequentAgents([]);
      return;
    }

    // 防止重复调用 - 添加调用状态检查
    if (frequentAgentsLoading) {
      console.log('常用Agent正在加载中，跳过重复调用');
      return;
    }

    setFrequentAgentsLoading(true);

    try {
      const requestParams: FrequentAgentRequest = {
        userName: username
      };

      console.log('获取常用Agent，参数:', requestParams, '调用时间:', new Date().toISOString());
      
      const response = await post<FrequentAgentResponse>('/rest/risk/control/manager/dataPlatform/frequentlyAgentList', requestParams);

      if (response?.status === 0) {
        const agentInfos = response.data || [];
        
        // 转换接口数据为AgentCard格式
        const transformedData: AgentCard[] = agentInfos.map((item, index) => ({
          id: item.agentCode,
          name: item.agentName,
          description: item.agentDescription || '专业的AI助手',
          category: item.agentCategory,
          author: item.agentBelong || '未知',
          status: item.status, // 使用接口实际返回的状态值
          gradient: generateGradient(index)
        }));
        
        console.log(`成功获取${transformedData.length}个常用Agent`);
        setFrequentAgents(transformedData);
      } else {
        throw new Error(response?.msg || '获取常用Agent失败');
      }
    } catch (err: any) {
      console.error('获取常用Agent失败:', err);
      setFrequentAgents([]); // 失败时显示空数组，不影响用户体验
    } finally {
      setFrequentAgentsLoading(false);
    }
  };

  // 接口响应类型定义
  interface AgentListResponse {
    status: number;
    data: {
      data: AgentDataItem[];
      total: number;
      pageNum: number;
      pageSize: number;
    };
    msg: string;
  }

  // 调用接口获取Agent列表的函数
  const fetchAgentList = async (category?: string, searchKeyword?: string) => {
    setLoading(true);
    setError(null);

    try {
      const requestParams: AgentListRequest = {
        agent_code: "",
        agent_name: searchKeyword || "",
        agent_category: category === 'all' ? "" : category || "",
        agent_belong: "",
        agent_icon: "",
        agent_manager: "",
        agent_user: "",
        agent_description: "",
        agent_prompt: "",
        create_time: "0",
        page_num: 1,
        page_size: 1000, // 获取所有数据，前端处理分页
        total: 0,
        user_name: ""
      };

      console.log('获取Agent列表，参数:', requestParams);
      const response = await post<AgentListResponse>('/rest/risk/control/manager/dataPlatform/agentList', requestParams);

      if (response?.status === 0) {
        const responseData = response.data;
        const agentItems = responseData?.data || [];
        const transformedData = transformAgentData(agentItems);
        
        // 保存分页信息（为将来的分页功能做准备）
        setPagination({
          total: responseData?.total || 0,
          current: responseData?.pageNum || 1,
          pageSize: responseData?.pageSize || 20
        });
        
        setAgentData(transformedData);
        console.log(`成功获取${agentItems.length}个Agent，总计${responseData?.total || 0}个`);
      } else {
        throw new Error(response?.msg || '获取Agent列表失败');
      }
    } catch (err: any) {
      console.error('获取Agent列表失败:', err);
      setError(err.message || '网络请求失败，请重试');
      // 如果接口失败，使用空数组，避免页面崩溃
      setAgentData([]);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时自动查询Agent列表和常用Agent
  useEffect(() => {
    console.log('AgentMarketplace组件挂载，开始初始化数据...');
    console.log('挂载时登录状态:', { isLoggedIn, username, isInitialized });
    
    // 自动查询所有Agent（"全部"分类）
    fetchAgentList('all');
    
    // 只有在登录状态下且未初始化时才调用常用Agent接口
    if (isLoggedIn && username && !isInitialized) {
      console.log('组件挂载 - 首次调用常用Agent接口');
      fetchFrequentAgents();
      setIsInitialized(true);
    }
    
    console.log('初始化数据查询已触发');
  }, []); // 保持空依赖数组，只在组件挂载时执行一次

  // 监听登录状态变化，重新获取常用Agent - 添加防重复逻辑
  useEffect(() => {
    // 跳过初始化阶段的调用，避免与挂载时的调用重复
    if (!isInitialized) {
      console.log('跳过初始化阶段的登录状态监听调用');
      return;
    }

    if (isLoggedIn && username) {
      console.log('登录状态变化，重新获取常用Agent');
      fetchFrequentAgents();
    }
  }, [isLoggedIn, username]);

  // 新增：监听初始化状态，在组件挂载后处理登录状态
  useEffect(() => {
    if (!isInitialized && isLoggedIn && username) {
      console.log('初始化完成 - 延迟调用常用Agent接口');
      // 使用setTimeout确保在挂载useEffect完成后执行
      const timer = setTimeout(() => {
        fetchFrequentAgents();
        setIsInitialized(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, isLoggedIn, username]);

  // 清除登录状态
  const clearLoginState = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
      localStorage.removeItem(STORAGE_KEYS.USERNAME);
    } catch (error) {
      console.error('清除登录状态失败:', error);
    }
  };

  // 处理登出 - 与全局登录系统集成
  const handleLogout = () => {
    showToastMessage('已退出登录');
    // 触发全局登出事件，由App.tsx统一处理状态清除和页面跳转
    window.dispatchEvent(new CustomEvent('userLogout'));
  };

  // 处理登录 - 跳转到登录页
  const handleLogin = () => {
    // 触发全局登录事件，让App.tsx处理页面跳转
    window.dispatchEvent(new CustomEvent('needLogin', {
      detail: { source: 'agent-marketplace' }
    }));
  };

  // 筛选逻辑优化：支持"全部"选项和搜索自动切换
  const filteredAgents = agentData.filter(agent => {
    // 搜索过滤
    const matchesSearch = searchQuery === '' ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 分类过滤
    const matchesCategory = selectedCategory === 'all' || selectedCategory === '' || agent.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 分页逻辑
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAgents = filteredAgents.slice(startIndex, endIndex);

  // 搜索防抖处理
  useEffect(() => {
    console.log('搜索防抖useEffect触发 - 当前搜索值:', searchQuery, '前一次搜索值:', previousSearchQuery);

    const currentQuery = searchQuery.trim();
    const previousQuery = previousSearchQuery.trim();

    // 【关键修复1】在处理完逻辑后再更新previousSearchQuery，避免影响清空检测
    if (currentQuery) {
      // 有搜索内容时，执行搜索查询
      console.log('检测到搜索内容，准备执行搜索查询:', currentQuery);
      const debounceTimer = setTimeout(() => {
        console.log('执行搜索查询:', currentQuery);
        fetchAgentList(undefined, currentQuery);
        // 【关键修复2】在搜索执行后更新previousSearchQuery
        setPreviousSearchQuery(currentQuery);
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else if (!currentQuery && previousQuery) {
      // 【关键修复3】搜索框从有内容变为空（清空）时，自动查询全部分类数据
      console.log('检测到搜索框清空事件 - 当前:', currentQuery, '前一次:', previousQuery);
      console.log('满足清空条件，准备触发全部分类查询');

      const clearDebounceTimer = setTimeout(() => {
        console.log('搜索框已清空，自动查询全部分类数据');
        // 重置到"全部"分类并查询
        setSelectedCategory('all');
        fetchAgentList('all');
        console.log('搜索框清空 - 已触发全部分类查询');
        // 【关键修复4】在清空查询执行后更新previousSearchQuery
        setPreviousSearchQuery('');
      }, 300); // 较短的延迟，提供更好的用户体验

      return () => clearTimeout(clearDebounceTimer);
    } else {
      // 【关键修复5】其他情况下也要更新previousSearchQuery以保持状态同步
      console.log('其他情况，更新previousSearchQuery状态');
      setPreviousSearchQuery(currentQuery);
    }
  }, [searchQuery]); // 【关键修复6】移除previousSearchQuery依赖，避免无限循环

  // 【调试增强】新增搜索框清空检测函数，用于测试
  const detectSearchClear = (newValue: string): boolean => {
    const currentTrimmed = searchQuery.trim();
    const newTrimmed = newValue.trim();
    const isClearEvent = currentTrimmed && !newTrimmed;
    console.log('搜索框清空检测:', { currentTrimmed, newTrimmed, isClearEvent });
    return isClearEvent; // 从有内容到空
  };

  // 当用户输入搜索内容时，自动切换到"全部"tab
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // 【调试增强】增强版搜索框变化处理，包含详细日志
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('搜索框输入变化:', {
      oldValue: searchQuery,
      newValue: newValue,
      isClearEvent: detectSearchClear(newValue),
      timestamp: new Date().toISOString()
    });

    handleSearchChange(newValue);
  };

  // 切换分类时重置页码
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    console.log('切换分类到:', category);

    // 如果当前有搜索内容，则清空搜索，让搜索useEffect处理
    if (searchQuery.trim()) {
      setSearchQuery('');
    }

    // 总是重新查询当前分类的数据
    fetchAgentList(category === 'all' ? undefined : category);
  };

  // 暂时注释掉会话点击事件
  // 暂时注释掉会话点击事件
  // Toast消息显示
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 暂时注释掉会话操作函数
  // 暂时注释掉会话操作函数
  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = () => {
      // 暂时注释掉菜单状态
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []); // 暂时注释掉历史会话功能 - activeSessionMenu依赖

  // 暂时注释掉Tab栏吸顶功能
  // 暂时注释掉Tab栏吸顶功能
  const formatSessionTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return timestamp.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 注释掉特定的 console.log
  // 暂时隐藏历史会话部分显示
  // 注释掉针对历史会话函数未定义的报错
  // 暂时注释掉会话链接 icon
  // 暂时注释掉模态框功能

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen bg-gray-800/90 backdrop-blur-xl border-r border-gray-700/50 z-10 transition-all duration-300 ease-in-out shadow-xl flex flex-col ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Toggle Button */}
        <div className={`pt-4 pb-2 flex items-center justify-center ${
          isSidebarCollapsed ? 'px-3' : 'px-6'
        }`}>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
            className="w-8 h-8 bg-gray-700/90 backdrop-blur-sm border border-gray-600/50 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 hover:bg-gray-600/90"
          >
            {isSidebarCollapsed ? (
              <Menu className="h-4 w-4 text-gray-300" />
            ) : (
              <X className="h-4 w-4 text-gray-300" />
            )}
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className={`transition-all duration-300 ${
            isSidebarCollapsed ? 'px-3 pb-6' : 'px-6 pb-6'
          }`}>
          {/* Logo区域 */}
          <div className={`flex items-center mb-6 cursor-pointer hover:opacity-80 transition-opacity ${
            isSidebarCollapsed ? 'justify-center' : ''
          }`} onClick={onBack} title={isSidebarCollapsed ? 'RiskAgent - 返回首页' : '返回首页'}>
            <img
              src="https://p4-ad.adkwai.com/udata/pkg/ks-ad-fe/Vector.png"
              alt="RiskAgent Logo"
              className={`transition-all duration-300 ${
                isSidebarCollapsed ? 'w-8 h-8' : 'w-10 h-10 mr-3'
              }`}
            />
            {!isSidebarCollapsed && <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">RiskAgent</span>}
          </div>

          {/* 功能按钮区 */}
          <nav className="space-y-2">
            <button
              onClick={onBack}
              title={isSidebarCollapsed ? '新会话' : ''}
              className={`group relative flex items-center w-full text-gray-200 hover:bg-blue-900/30 hover:text-blue-400 rounded-xl transition-all duration-200 hover:scale-105 ${
                isSidebarCollapsed ? 'justify-center p-3' : 'px-4 py-3'
              }`}
            >
              <MessageSquare className={`flex-shrink-0 transition-all duration-200 ${
                isSidebarCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'
              }`} />
              {!isSidebarCollapsed && <span className="truncate">新会话</span>}
            </button>
            <div
              title={isSidebarCollapsed ? 'Agent广场' : ''}
              className={`group relative flex items-center w-full bg-gradient-to-r from-blue-900/30 to-indigo-900/30 text-blue-400 rounded-xl border border-blue-600/50 shadow-sm ${
                isSidebarCollapsed ? 'justify-center p-3' : 'px-4 py-3'
              }`}
            >
              <Grid3X3 className={`flex-shrink-0 transition-all duration-200 ${
                isSidebarCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'
              }`} />
              {!isSidebarCollapsed && <span className="truncate">Agent广场</span>}
            </div>
            <button
              onClick={() => navigate('/my-agents')}
              title={isSidebarCollapsed ? '我的 Agent' : ''}
              className={`group relative flex items-center w-full text-gray-200 hover:bg-blue-900/30 hover:text-blue-400 rounded-xl transition-all duration-200 hover:scale-105 ${
                isSidebarCollapsed ? 'justify-center p-3' : 'px-4 py-3'
              }`}
            >
              <Settings className={`flex-shrink-0 transition-all duration-200 ${
                isSidebarCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'
              }`} />
              {!isSidebarCollapsed && <span className="truncate">我的 Agent</span>}
            </button>
          </nav>
          </div>

          {/* 常用Agent区域 */}
          {!isSidebarCollapsed && (
            <div className="px-6 pb-6">
            {/* 常用Agent标题和加载状态 */}
            <h3 className="text-sm font-semibold text-gray-400 mb-4">常用Agent</h3>
            
            {!isLoggedIn ? (
              // 未登录时显示提示
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-400 text-xs mb-3">登录后查看您的常用Agent</p>
                <button
                  onClick={handleLogin}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  立即登录
                </button>
              </div>
            ) : frequentAgentsLoading ? (
              // 加载中状态
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center px-4 py-3 bg-gray-700/30 rounded-xl animate-pulse">
                    <div className="w-4 h-4 bg-gray-600 rounded-full mr-3"></div>
                    <div className="h-3 bg-gray-600 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            ) : frequentAgents.length > 0 ? (
              // 显示常用Agent列表
              <div className="space-y-2">
                {frequentAgents.map((agent) => (
                  <div 
                    key={agent.id}
                    onClick={() => {
                      if (agent.status === 0) {
                        showToastMessage('该Agent暂时未开放使用');
                        return;
                      }
                      onStartAgent?.(agent);
                    }}
                    className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/40 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm group"
                    title={agent.description}
                  >
                    <div className={`w-4 h-4 bg-gradient-to-r ${agent.gradient} rounded-full mr-3 shadow-sm flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-gray-200 group-hover:text-white transition-colors">
                        {agent.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        by {agent.author}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 无常用Agent时显示空状态
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <div className="text-gray-400">⭐</div>
                </div>
                <p className="text-gray-400 text-xs mb-2">暂无常用Agent</p>
                <p className="text-gray-500 text-xs">使用Agent后会自动添加到这里</p>
              </div>
            )}
            </div>
          )}
        </div>

        {/* 暂时注释掉历史会话区域 */}
        {/* 暂时注释掉历史会话区域 */}

        {/* User Info Section - Sticky Bottom */}
        <div className="flex-shrink-0 border-t border-gray-700/50 bg-gray-800/95 backdrop-blur-sm">
          <div className={`transition-all duration-300 ${
            isSidebarCollapsed ? 'p-3' : 'p-6'
          }`}>
            {isLoggedIn ? (
              <div className="transition-opacity duration-300">
                {isSidebarCollapsed ? (
                  <button
                    onClick={handleLogout}
                    title={`${username || '用户'} - 点击退出登录`}
                    className="w-full aspect-square flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg hover:scale-105 transition-all duration-200 hover:shadow-xl hover:from-blue-600 hover:to-purple-700"
                  >
                    <User className="h-5 w-5 text-white flex-shrink-0" />
                  </button>
                ) : (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{username || '用户'}</div>
                      <button
                        onClick={handleLogout}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium inline-flex items-center space-x-1 mt-1 group"
                      >
                        <LogOut className="h-3 w-3 group-hover:scale-110 transition-transform" />
                        <span>退出登录</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLogin}
                title={isSidebarCollapsed ? '点击登录' : ''}
                className={`w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg font-medium ${
                  isSidebarCollapsed ? 'aspect-square p-3' : 'px-4 py-3'
                }`}
              >
                <User className={`flex-shrink-0 ${
                  isSidebarCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-2'
                }`} />
                {!isSidebarCollapsed && <span className="truncate">登录</span>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <div className="bg-gray-900/30 backdrop-blur-sm px-8 py-6 border-b border-gray-700/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Minimal Logo and Search */}
              <div className="flex items-center space-x-6 flex-1">
                <div className="flex items-center space-x-3">
                  <img src="https://p4-ad.adkwai.com/udata/pkg/ks-ad-fe/Vector.png" alt="RiskAgent Logo" className="w-8 h-8" />
                  <h1 className="text-xl font-bold text-white">RiskAgent</h1>
                </div>

                {/* Inline Search Bar */}
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="搜索Agent名称或描述..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-white placeholder-gray-500 text-sm transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs Placeholder - 占位元素，防止吸顶时内容跳动 */}
        {/* 暂时注释掉占位元素 */}
        {/* 暂时注释掉占位元素 */}

        {/* Category Tabs */}
        <div
          className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 px-8 py-6 shadow-sm transition-all duration-300 relative"
        >
          <div className="flex space-x-8">
            {categoryConfigs.map((category) => (
              <button
                key={category.code}
                onClick={() => handleCategoryChange(category.code)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all duration-200 hover:scale-105 ${
                  selectedCategory === category.code
                    ? 'border-blue-500 text-blue-400 shadow-sm'
                    : 'border-transparent text-gray-400 hover:text-blue-400'
                }`}
              >
                {category.displayName}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-3">
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mr-3"></div>
                      加载中...
                    </span>
                  ) : error ? (
                    <span className="flex items-center">
                      <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
                      加载失败
                    </span>
                  ) : (
                    getCategoryDisplayName(selectedCategory)
                  )}
                  {searchQuery && (
                    <span className="ml-3 text-lg text-gray-400">搜索: "{searchQuery}"</span>
                  )}
                </h2>
                <p className="text-gray-300 font-medium">
                  {selectedCategory === 'all' ? '探索所有Agent，找到最适合您的智能助手' : '专业的风险管理Agent，为您的业务保驾护航'}
                </p>
              </div>
              {(searchQuery || selectedCategory === 'all') && (
                <div className="text-right">
                  {loading ? (
                    <p className="text-sm text-gray-400">正在搜索...</p>
                  ) : error ? (
                    <p className="text-sm text-red-400">加载失败</p>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-400">
                        找到 <span className="text-blue-400 font-semibold">{filteredAgents.length}</span> 个Agent
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                          }}
                          className="mt-2 text-xs text-gray-500 hover:text-blue-400 transition-colors duration-200"
                        >
                          清除搜索
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Agent Grid */}
          {currentAgents.length > 0 ? (
            <> 
              {loading && (
                <div className="mb-6 bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-3"></div>
                  <span className="text-blue-300 font-medium">正在加载Agent数据...</span>
                </div>
              )}
              
              {error && (
                <div className="mb-6 bg-red-900/20 border border-red-600/30 rounded-lg p-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                  <span className="text-red-300 font-medium">{error}</span>
                  <button onClick={() => fetchAgentList(selectedCategory === 'all' ? undefined : selectedCategory)} className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">重试</button>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentAgents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => {
                      if (agent.status === 0) {
                        showToastMessage('该Agent暂时未开放使用');
                        return;
                      }
                      if (onStartAgent) {
                        onStartAgent(agent);
                      }
                    }}
                    className={`group bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/40 p-5 hover:bg-gray-800/80 hover:border-gray-600/60 transition-colors duration-200 cursor-pointer ${loading ? 'opacity-70 pointer-events-none' : ''}`}
                  >
                    <div className="flex items-start space-x-3 mb-4">
                      <div className={`w-10 h-10 bg-gradient-to-r ${agent.gradient} rounded-lg flex-shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white truncate">{agent.name}</h3>
                          {selectedCategory === 'all' && (
                            <span className="px-2 py-0.5 bg-gray-700/40 text-gray-400 text-xs rounded flex-shrink-0">
                              {getCategoryDisplayName(agent.category)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-1">by {agent.author}</p>
                      </div>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed line-clamp-2 mb-4 font-medium">
                      {agent.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">点击查看详情</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (agent.status === 0) {
                            showToastMessage('该Agent暂时未开放使用');
                            return;
                          }
                          if (onStartAgent) {
                            onStartAgent(agent);
                          }
                        }}
                        className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700/50 group-hover:bg-blue-500 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/40 active:scale-95"
                        title="进入对话"
                      >
                        <ArrowLeft className="h-4 w-4 text-gray-300 group-hover:text-white transform rotate-180 transition-all duration-300 group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-all disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg transition-all ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-all disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-400 mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-white mb-3">正在加载Agent数据</h3>
                  <p className="text-gray-400">请稍候...</p>
                </>
              ) : error ? (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-red-700 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <AlertCircle className="h-10 w-10 text-red-200" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">加载失败</h3>
                  <p className="text-gray-400 mb-6">{error}</p>
                  <button
                    onClick={() => fetchAgentList(selectedCategory === 'all' ? undefined : selectedCategory)}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    重试加载
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">未找到匹配的Agent</h3>
                  <p className="text-gray-400 mb-6">
                    {searchQuery
                      ? `没有找到与 "${searchQuery}" 相关的Agent，请尝试其他关键词`
                      : `当前分类下暂无Agent`
                    }
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      清除搜索条件
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 z-50 animate-slide-in backdrop-blur-sm">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 暂时注释掉模态框 */}
      {/* 暂时注释掉模态框 */}
      {/* 暂时注释掉重命名模态框 */}
      {/* 暂时注释掉删除确认模态框 */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}


