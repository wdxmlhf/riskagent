import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Shield, MessageSquare, Grid3X3, Paperclip, Copy, Share, CheckCircle, AlertCircle, X, User, Bot, Menu, MoreVertical, Trash2, Edit2, Link2, Check, Clock, LogOut } from 'lucide-react';
import { formatTimestamp } from '../markdownRenderer';
import { post } from '../common/axios';
import { ambase } from '../integrations/ambase';
import { UserStore } from '../store/UserStore';
import { useSnapshot } from 'valtio';
import MessageContent from './MessageContent';
import ChatInput from './ChatInput';
import { useAgentManagement } from '../hooks/useAgentManagement';
import { useChatSession } from '../hooks/useChatSession';

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

interface HistorySession {
  id: string;
  title: string;
  agentName: string;
  timestamp: Date;
  isActive: boolean;
  messages: any[];
  type: 'chat' | 'agent-chat';
}

interface AgentChatPageProps {
  onBack: () => void;
  agent: {
    id: string;
    name: string;
    description: string;
    category: string;
    author: string;
    gradient: string;
  };
  username: string;
  onLogout: () => void;
  onCreateHistorySession: (title: string, agentName: string) => void;
  historySessions?: HistorySession[];
  onSessionSwitch?: (sessionId: string) => void;
  onAgentSwitch?: (newAgent: any) => void;
  initialMessage?: string;
  onMessageSent?: () => void;
}

// 反馈相关接口类型
interface FeedbackRequest {
  timestamp: number;
  userName: string;
  workflowCode: string;
  feedback: string;
  chatMessage: string;
}

interface FeedbackOption {
  option: 'yes' | 'no';
  text: string;
  timestamp: string;
}

interface ChatMessageItem {
  role: 'user' | 'assistant';
  content: string;
  contentType?: 'markdown';
  time: string;
}

interface FeedbackResponse {
  data: {
    msg: string;
    dataString: string;
    status: number;
  };
  requestId: string;
}

export default function AgentChatPage({
  onBack,
  agent,
  username,
  onLogout,
  onCreateHistorySession,
  historySessions = [],
  onSessionSwitch,
  onAgentSwitch,
  initialMessage = '',
  onMessageSent
}: AgentChatPageProps) {
  // 使用自定义hooks
  const {
    frequentAgents,
    frequentAgentsLoading,
    fetchFrequentAgents,
    getCategoryDisplayName,
    getAgentDisplayName,
    generatePersonalizedWelcome,
    generateWelcomeMessage
  } = useAgentManagement();

  const {
    messages,
    setMessages,
    currentChatId,
    setCurrentChatId,
    isLoadingHistory,
    checkAgentChatHistory,
    sendMessage,
    buildHistoryMessages,
    buildSingleHistoryMessages
  } = useChatSession();

  // 状态管理
  const [inputValue, setInputValue] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [resolvedMessages, setResolvedMessages] = useState<Set<string>>(new Set());
  const [unresolvedMessages, setUnresolvedMessages] = useState<Set<string>>(new Set());
  const [isShareMode, setIsShareMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(agent);
  const [activeSessionMenu, setActiveSessionMenu] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState<string>('');
  const [deleteSessionId, setDeleteSessionId] = useState<string>('');
  const [renameValue, setRenameValue] = useState('');
  const [isAgentSwitching, setIsAgentSwitching] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [hasAutoSent, setHasAutoSent] = useState(false);
  const [isAgentSwitchingLoading, setIsAgentSwitchingLoading] = useState(false);
  const [currentFeedbackMessageId, setCurrentFeedbackMessageId] = useState<string>('');

  // 获取当前登录状态
  const { isLoggedIn: currentLoginStatus, username: currentUsername } = getStoredLoginState();
  const { currentUser } = useSnapshot(UserStore);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 优先使用SSO用户信息
  const getActualUserName = () => {
    return currentUser?.username || username || currentUsername || 'anonymous';
  };

  // 监听传入的agent属性变化
  useEffect(() => {
    setCurrentAgent(agent);
    console.log('当前Agent数据结构:', {
      agent: agent,
      hasAgentName: 'agentName' in agent,
      hasName: 'name' in agent,
      agentName: agent.agentName || '未定义',
      name: agent.name || '未定义',
      allKeys: Object.keys(agent)
    });
  }, [agent]);

  // 处理初始消息
  useEffect(() => {
    if (initialMessage && initialMessage.trim() && !hasAutoSent) {
      console.log('收到初始消息:', initialMessage);
      setInputValue(initialMessage);
    }
  }, [initialMessage, hasAutoSent]);

  // 初始化Agent介绍消息
  useEffect(() => {
    if (currentAgent && currentAgent.id) {
      checkAgentChatHistory(currentAgent, getActualUserName(), () => generateWelcomeMessage(currentAgent));
      if (!frequentAgents.length && currentUser) {
        fetchFrequentAgents(getActualUserName());
      }
    }
  }, [currentUser]);

  // 自动发送初始消息
  useEffect(() => {
    if (initialMessage && initialMessage.trim() && !hasAutoSent && messages.length > 0) {
      const timer = setTimeout(() => {
        console.log('准备自动发送消息:', initialMessage);
        if (inputValue === initialMessage && !hasAutoSent) {
          console.log('自动发送消息:', initialMessage);
          setHasAutoSent(true);
          handleSendMessage();
          if (onMessageSent) {
            onMessageSent();
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages, inputValue, initialMessage, hasAutoSent, onMessageSent]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 监听登录状态变化
  useEffect(() => {
    if (currentLoginStatus && !frequentAgents.length) {
      fetchFrequentAgents(getActualUserName());
    }
  }, [currentLoginStatus, currentUsername]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeSessionMenu) {
        setActiveSessionMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeSessionMenu]);

  // 格式化消息时间
  const formatMessageTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 获取当前用户信息
  const getCurrentUser = () => {
    return {
      username: getActualUserName()
    };
  };

  // 反馈提交函数
  const submitFeedback = async (
    isResolved: boolean,
    feedbackText: string = '',
    relatedMessages: any[],
    messageId?: string
  ): Promise<boolean> => {
    try {
      setIsSubmittingFeedback(true);

      const currentTimestamp = Date.now();
      const currentUserInfo = getCurrentUser();

      const feedbackOption: FeedbackOption = {
        option: isResolved ? 'yes' : 'no',
        text: feedbackText,
        timestamp: new Date(currentTimestamp).toISOString()
      };

      const chatMessages: ChatMessageItem[] = relatedMessages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
        contentType: msg.type === 'ai' ? 'markdown' : undefined,
        time: formatMessageTime(msg.timestamp)
      }));

      const requestParams: FeedbackRequest = {
        timestamp: currentTimestamp,
        userName: currentUserInfo.username,
        workflowCode: currentAgent.id,
        feedback: JSON.stringify(feedbackOption),
        chatMessage: JSON.stringify(chatMessages)
      };

      console.log('提交反馈信息:', requestParams);

      const response = await post<FeedbackResponse>(
        '/rest/risk/control/manager/dataPlatform/feedBack',
        requestParams
      );

      console.log('反馈提交结果:', response);

      if (response?.data?.status === 0) {
        const successMessage = isResolved
          ? '感谢您的反馈！问题已标记为已解决'
          : '感谢您的反馈！我们会继续改进';
        showToastMessage(successMessage);
        return true;
      } else {
        throw new Error(response?.data?.msg || '提交失败');
      }

    } catch (error: any) {
      console.error('反馈提交失败:', error);
      showToastMessage('反馈提交失败，请重试');
      return false;
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // 获取与指定消息相关的对话内容
  const getRelatedMessages = (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return [];

    const relatedMessages: any[] = [];

    if (messageIndex > 0 && messages[messageIndex - 1].type === 'user') {
      relatedMessages.push(messages[messageIndex - 1]);
      relatedMessages.push(messages[messageIndex]);
    } else {
      relatedMessages.push(messages[messageIndex]);
    }

    return relatedMessages;
  };

  const handleSendMessage = () => {
    sendMessage(inputValue, currentAgent, getActualUserName(), onCreateHistorySession);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showToastMessage('复制成功');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToastMessage('复制成功');
    }
  };

  const handleResolveToggle = async (messageId: string) => {
    const isCurrentlyResolved = resolvedMessages.has(messageId);

    if (!isCurrentlyResolved) {
      const relatedMessages = getRelatedMessages(messageId);
      const feedbackSuccess = await submitFeedback(true, '', relatedMessages, messageId);

      if (!feedbackSuccess) {
        return;
      }
    }

    setResolvedMessages(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyResolved) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
        setUnresolvedMessages(prevUnresolved => {
          const newUnresolvedSet = new Set(prevUnresolved);
          newUnresolvedSet.delete(messageId);
          return newUnresolvedSet;
        });
      }
      return newSet;
    });
  };

  const handleUnresolvedClick = (messageId: string) => {
    if (!unresolvedMessages.has(messageId)) {
      setCurrentFeedbackMessageId(messageId);
      setShowFeedbackModal(true);
    } else {
      setUnresolvedMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons(prev =>
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmitFeedback = async () => {
    if (!currentFeedbackMessageId) return;

    let combinedFeedbackText = '';
    if (selectedReasons.length > 0) {
      combinedFeedbackText += `选择的问题: ${selectedReasons.join(', ')}`;
    }
    if (feedbackText.trim()) {
      if (combinedFeedbackText) combinedFeedbackText += '\n';
      combinedFeedbackText += `详细说明: ${feedbackText.trim()}`;
    }

    const relatedMessages = getRelatedMessages(currentFeedbackMessageId);
    const feedbackSuccess = await submitFeedback(false, combinedFeedbackText, relatedMessages, currentFeedbackMessageId);

    if (feedbackSuccess) {
      setUnresolvedMessages(prev => new Set([...prev, currentFeedbackMessageId]));
    }

    setShowFeedbackModal(false);
    setCurrentFeedbackMessageId('');
    setSelectedReasons([]);
    setFeedbackText('');
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setCurrentFeedbackMessageId('');
    setSelectedReasons([]);
    setFeedbackText('');
  };

  // Agent切换处理函数
  const handleAgentSwitch = async (targetAgent: any) => {
    console.log('开始Agent切换流程:', getAgentDisplayName(targetAgent));

    if (targetAgent.status === 0) {
      showToastMessage('该Agent暂时未开放使用');
      return;
    }

    if (isAgentSwitching) return;

    setIsAgentSwitching(true);
    setIsAgentSwitchingLoading(true);

    showToastMessage(`正在切换到 ${getAgentDisplayName(targetAgent)}...`);

    try {
      const switchingMessage = {
        id: 'agent-switching-loading',
        type: 'ai' as const,
        content: `正在切换到 ${getAgentDisplayName(targetAgent)}，请稍候...`,
        timestamp: new Date(),
        isGenerating: true
      };
      setMessages([switchingMessage]);

      setCurrentChatId('0');
      setInputValue('');
      setResolvedMessages(new Set());
      setUnresolvedMessages(new Set());
      setSelectedMessages(new Set());

      if (isShareMode) {
        setIsShareMode(false);
      }

      if (currentAgent.id === targetAgent.id) {
        const welcomeMessage = {
          id: 'welcome-same-agent',
          type: 'ai' as const,
          content: generatePersonalizedWelcome(targetAgent),
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        showToastMessage('当前已是该Agent');
        setIsAgentSwitchingLoading(false);
        return;
      }

      setCurrentAgent(targetAgent);
      console.log('Agent切换 - 当前Agent状态已更新为:', getAgentDisplayName(targetAgent));

      // 检查历史会话
      await checkAgentChatHistory(targetAgent, getActualUserName(), () => generateWelcomeMessage(targetAgent));

      if (onAgentSwitch) {
        onAgentSwitch(targetAgent);
      }

      if (onCreateHistorySession) {
        const sessionTitle = `新对话 - ${getAgentDisplayName(targetAgent)}`;
        onCreateHistorySession(sessionTitle, getAgentDisplayName(targetAgent));
      }

      console.log('Agent切换流程完成:', getAgentDisplayName(targetAgent));

    } catch (error) {
      console.error('Agent切换失败:', error);
      showToastMessage('切换Agent失败，请重试');

      setCurrentAgent(targetAgent);
      setCurrentChatId('0');
      setMessages([]);

      const fallbackMessage = {
        id: 'welcome-fallback',
        type: 'ai' as const,
        content: generateWelcomeMessage(currentAgent),
        timestamp: new Date()
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsAgentSwitchingLoading(false);
      setIsAgentSwitching(false);
    }
  };

  // 处理登出
  const handleLogout = () => {
    showToastMessage('已退出登录');
    window.dispatchEvent(new CustomEvent('userLogout'));
  };

  // 处理登录
  const handleLogin = () => {
    window.dispatchEvent(new CustomEvent('needLogin', {
      detail: { source: 'agent-chat-page' }
    }));
  };

  const feedbackReasons = [
    '没有理解问题',
    '没有完成任务',
    '编造事实',
    '废话太多',
    '没有创意',
    '文风不好',
    '引用网页质量不高',
    '信息陈旧'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen bg-gray-800/90 backdrop-blur-xl border-r border-gray-700/50 z-10 transition-all duration-300 ease-in-out shadow-xl flex flex-col ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Toggle Button */}
          <div className={`flex items-center justify-center pt-4 pb-2 ${
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
              <button
                onClick={() => {
                  onBack();
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('navigateToAgentMarketplace'));
                  }, 100);
                }}
                title={isSidebarCollapsed ? 'Agent广场' : ''}
                className={`group relative flex items-center w-full text-gray-200 hover:bg-blue-900/30 hover:text-blue-400 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isSidebarCollapsed ? 'justify-center p-3' : 'px-4 py-3'
                }`}
              >
                <Grid3X3 className={`flex-shrink-0 transition-all duration-200 ${
                  isSidebarCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'
                }`} />
                {!isSidebarCollapsed && <span className="truncate">Agent广场</span>}
              </button>
            </nav>
          </div>

          {!isSidebarCollapsed && (
            <div className="px-6 pb-6">
              {/* Current Agent */}
              <div className="mt-8 transition-opacity duration-300">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">当前Agent</h3>
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30 mb-6">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 bg-gradient-to-r ${currentAgent.gradient} rounded-lg flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{getAgentDisplayName(currentAgent)}</div>
                      <div className="text-xs text-gray-400 truncate">{getCategoryDisplayName(currentAgent.category)}</div>
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-gray-400 mb-4">常用Agent</h3>
                {!currentLoginStatus ? (
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
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center px-4 py-3 bg-gray-700/30 rounded-xl animate-pulse">
                        <div className="w-4 h-4 bg-gray-600 rounded-full mr-3"></div>
                        <div className="h-3 bg-gray-600 rounded flex-1"></div>
                      </div>
                    ))}
                  </div>
                ) : frequentAgents.length > 0 ? (
                  <div className="space-y-2">
                    {frequentAgents.map((agentItem) => (
                      <div
                        key={agentItem.id}
                        onClick={() => {
                          if (agentItem.status === 0) {
                            showToastMessage('该Agent暂时未开放使用');
                            return;
                          }
                          if (!isAgentSwitching) {
                            handleAgentSwitch(agentItem);
                          }
                        }}
                        className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 group ${
                          isAgentSwitching || agentItem.status === 0 ? 'opacity-50 cursor-not-allowed' :
                          'text-gray-200 hover:bg-gray-700/40 cursor-pointer hover:scale-[1.02] hover:shadow-sm'
                        } ${currentAgent.id === agentItem.id ? 'bg-blue-900/20 border border-blue-600/30' : ''}`}
                        title={agentItem.description}
                      >
                        <div className={`w-4 h-4 bg-gradient-to-r ${agentItem.gradient} rounded-full mr-3 shadow-sm flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-gray-200 group-hover:text-white transition-colors">
                            {getAgentDisplayName(agentItem)}
                            {agentItem.status === 0 && (
                              <span className="ml-2 px-1.5 py-0.5 bg-red-900/40 text-red-400 text-xs rounded">
                                不可用
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            by {agentItem.agentBelong}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <div className="text-gray-400">⭐</div>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">暂无常用Agent</p>
                    <p className="text-gray-500 text-xs">使用Agent后会自动添加到这里</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Section - Sticky Bottom */}
        <div className="flex-shrink-0 border-t border-gray-700/50 bg-gray-800/95 backdrop-blur-sm">
          <div className={`transition-all duration-300 ${
            isSidebarCollapsed ? 'p-3' : 'p-6'
          }`}>
            {currentLoginStatus ? (
              <div className="transition-opacity duration-300">
                {isSidebarCollapsed ? (
                  <button
                    onClick={handleLogout}
                    title={`${currentUsername || username || '用户'} - 点击退出登录`}
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
                      <div className="text-sm font-semibold text-white truncate">{currentUsername || username || '用户'}</div>
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

      {/* Main Chat Area */}
      <div className={`min-h-screen transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 px-6 py-5 shadow-lg z-20">
          <div className="flex items-center">
            <div className={`w-8 h-8 bg-gradient-to-r ${currentAgent.gradient} rounded-xl mr-4 shadow-lg`}></div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">{getAgentDisplayName(currentAgent)}</span>
            <span className="ml-3 text-sm text-gray-300 font-medium">- {getCategoryDisplayName(currentAgent.category)}</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-8 pb-32 bg-gradient-to-b from-gray-900/50 to-gray-800/80">
          <div className="max-w-4xl mx-auto space-y-6">
            {isLoadingHistory && (
              <div className="text-center text-gray-400 py-4">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>正在加载对话历史...</span>
                </div>
              </div>
            )}

            {isAgentSwitchingLoading && (
              <div className="text-center text-gray-400 py-6">
                <div className="inline-flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="text-lg font-medium">正在切换Agent...</span>
                  <span className="text-sm text-gray-500">请稍候，正在加载历史会话</span>
                </div>
              </div>
            )}

            {!isAgentSwitchingLoading && !isLoadingHistory && messages.map((message) => (
              <div key={message.id} className={`flex items-start ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${isShareMode ? 'pl-12' : ''}`}>
                {message.type === 'user' ? (
                  // User Message
                  <div className="flex flex-col items-end max-w-2xl">
                    <div className="flex items-end space-x-3">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-4 rounded-2xl rounded-br-md shadow-xl">
                        <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2 mr-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTimestamp(message.timestamp)}</span>
                    </div>
                  </div>
                ) : (
                  // AI Message
                  <div className="flex items-start space-x-3 max-w-4xl w-full">
                    <div className={`w-10 h-10 bg-gradient-to-r ${currentAgent.gradient} rounded-xl flex items-center justify-center flex-shrink-0 relative shadow-lg`}>
                      <Bot className="h-4 w-4 text-white" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl rounded-tl-md shadow-xl border border-gray-600/50 p-8 flex-1">
                      {message.isGenerating ? (
                        <div className="space-y-4">
                          <div className="flex items-center text-gray-300">
                            <div className="flex space-x-1 mr-3">
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm font-medium">正在分析中...</span>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-600/80 rounded-lg animate-pulse"></div>
                            <div className="h-4 bg-gray-600/80 rounded-lg animate-pulse w-3/4"></div>
                            <div className="h-4 bg-gray-600/80 rounded-lg animate-pulse w-1/2"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <MessageContent content={message.content} />

                          <div className="flex items-center text-xs text-gray-400 pt-2 border-t border-gray-600/30">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatTimestamp(message.timestamp)}</span>
                          </div>

                          {message.type === 'ai' && !message.isGenerating && messages.length > 1 && (
                            <div className="flex items-center space-x-6 pt-4 border-t border-gray-600/50">
                              <button
                                onClick={() => handleCopy(message.content)}
                                className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-all duration-200 group hover:scale-105"
                              >
                                <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">复制</span>
                              </button>
                              <button
                                onClick={() => handleResolveToggle(message.id)}
                                className={`flex items-center space-x-2 transition-all group ${
                                  resolvedMessages.has(message.id)
                                    ? 'text-green-400 bg-green-900/30 px-4 py-2 rounded-full border border-green-600/50 shadow-sm'
                                    : 'text-gray-300 hover:text-green-400'
                                }`}
                                disabled={isSubmittingFeedback}
                              >
                                <CheckCircle className={`h-4 w-4 group-hover:scale-110 transition-transform ${
                                  resolvedMessages.has(message.id) ? 'fill-current' : ''
                                }`} />
                                <span className="text-sm font-medium">解决</span>
                              </button>
                              <button
                                onClick={() => handleUnresolvedClick(message.id)}
                                className={`flex items-center space-x-2 transition-all group ${
                                  unresolvedMessages.has(message.id)
                                    ? 'text-red-400 bg-red-900/30 px-4 py-2 rounded-full border border-red-600/50 shadow-sm'
                                    : 'text-gray-300 hover:text-red-400'
                                }`}
                                disabled={isSubmittingFeedback}
                              >
                                <AlertCircle className={`h-4 w-4 group-hover:scale-110 transition-transform ${
                                  unresolvedMessages.has(message.id) ? 'fill-current' : ''
                                }`} />
                                <span className="text-sm font-medium">未解决</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Input Area */}
        <div className={`fixed bottom-0 bg-gray-800/95 backdrop-blur-md border-t border-gray-700/50 shadow-2xl transition-all duration-300 ease-in-out z-30 ${
          isSidebarCollapsed ? 'left-16' : 'left-64'
        } right-0 ${isShareMode ? 'bottom-16' : 'bottom-0'}`}>
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                disabled={isShareMode || isAgentSwitchingLoading}
                placeholder="Ask anything"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 z-50 animate-slide-in backdrop-blur-sm">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in border border-gray-600/50">
            <div className="flex items-center justify-between p-8 border-b border-gray-700/50">
              <h3 className="text-xl font-bold text-white">抱歉，RiskAgent让你有不好的感受</h3>
              <button
                onClick={handleCloseFeedbackModal}
                className="text-gray-400 hover:text-gray-200 transition-all hover:scale-105 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <p className="text-gray-200 mb-6 font-medium">请选择理由帮助我们做的更好</p>
                <div className="grid grid-cols-2 gap-3">
                  {feedbackReasons.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => handleReasonToggle(reason)}
                      className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-sm ${
                        selectedReasons.includes(reason)
                          ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 text-blue-300 border border-blue-600/50 shadow-lg'
                          : 'bg-gray-700/80 text-gray-200 border border-gray-600/50 hover:bg-gray-600/80 hover:shadow-md'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-200 mb-3 font-semibold">欢迎说说你的想法</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="请详细描述遇到的问题..."
                  className="w-full h-36 px-5 py-4 border border-gray-600/50 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium bg-gray-700/50 focus:bg-gray-700 shadow-sm text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-8 border-t border-gray-700/50">
              <button
                onClick={handleCloseFeedbackModal}
                className="px-8 py-3 text-gray-300 hover:text-white transition-all hover:scale-105 font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={isSubmittingFeedback}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all hover:scale-105 shadow-xl font-semibold"
              >
                {isSubmittingFeedback ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>提交中...</span>
                  </div>
                ) : (
                  '提交反馈'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
      `}</style>
    </div>
  );
}
