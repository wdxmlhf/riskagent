import { useState, useCallback } from 'react';
import { post } from '../common/axios';
import { parseDataString, parseAnswerContent } from '../utils/chatParser';

// 消息相关接口类型定义
export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
  queryInfo?: string;
  hasChart?: boolean;
  hasTable?: boolean;
}

// 聊天接口请求参数类型
export interface ChatRequest {
  question: string;
  workflowCode: string;
  userName: string;
  chatId: string;
}

export interface ChatResponse {
  data: {
    msg: string;
    dataString: string;
    status: number;
  };
  requestId: string;
}

// 历史记录相关接口
export interface ChatRecord {
  agentCode: string;
  chatId: string;
  questionId: string;
  answerId: string;
  question: string;
  answer: string;
  chatTime: string;
  id: number;
  createTime: string;
  updateTime: string;
}

export interface ChatInfoRequest {
  agentCode: string;
  pageNum: number;
  pageSize: number;
  chatId: string;
  userName: string;
}

export interface ChatInfoResponse {
  status: number;
  data: {
    pageNum: number;
    pageSize: number;
    total: number;
    data: ChatRecord[];
  };
  msg: string;
  requestId: string;
}

export interface AgentChatCheckRequest {
  agentCode: string;
  userName: string;
}

export interface AgentChatHistory {
  agentCode: string;
  chatId: string;
  questionId: string;
  answerId: string;
  question: string;
  answer: string;
  chatTime: string;
  id: number;
  createTime: string;
  updateTime: string;
}

export interface AgentChatHistoryResponse {
  status: number;
  data: AgentChatHistory;
  msg: string;
  requestId: string;
}

export function useChatSession() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('0');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 获取正确的agentCode/workflowCode
  const getAgentCode = useCallback((agent: any): string => {
    const agentCode = agent.agentCode || agent.id;
    console.log('获取Agent代码:', { agent, agentCode });
    return agentCode;
  }, []);

  // 检查历史数据是否有效
  const isValidHistoryData = useCallback((historyData: AgentChatHistory): boolean => {
    const hasValidQuestion = historyData.question && historyData.question.trim() !== '';
    const hasValidAnswer = historyData.answer && historyData.answer.trim() !== '';

    console.log('检查历史数据有效性:', {
      question: historyData.question || '空',
      answer: historyData.answer || '空',
      hasValidQuestion,
      hasValidAnswer
    });

    return hasValidQuestion && hasValidAnswer;
  }, []);

  // 构建历史消息
  const buildHistoryMessages = useCallback((chatRecords: ChatRecord[], generateWelcomeMessage: () => string): Message[] => {
    const historyMessages: Message[] = [
      {
        id: 'welcome-0',
        type: 'ai',
        content: generateWelcomeMessage(),
        timestamp: new Date()
      }
    ];

    chatRecords.forEach((record) => {
      historyMessages.push({
        id: `history-user-${record.questionId || record.id}`,
        type: 'user',
        content: record.question,
        timestamp: new Date(record.chatTime || record.createTime)
      });
      
      historyMessages.push({
        id: `history-ai-${record.answerId || record.id}`,
        type: 'ai',
        content: parseAnswerContent(record.answer),
        timestamp: new Date(record.chatTime || record.createTime)
      });
    });

    return historyMessages;
  }, []);

  // 构建单条历史消息
  const buildSingleHistoryMessages = useCallback((historyData: AgentChatHistory, generateWelcomeMessage: () => string): Message[] => {
    return [
      {
        id: 'welcome-0',
        type: 'ai',
        content: generateWelcomeMessage(),
        timestamp: new Date()
      },
      {
        id: `history-user-${historyData.questionId || 'last'}`,
        type: 'user',
        content: historyData.question,
        timestamp: new Date(historyData.chatTime || Date.now())
      },
      {
        id: `history-ai-${historyData.answerId || 'last'}`,
        type: 'ai',
        content: parseAnswerContent(historyData.answer),
        timestamp: new Date(historyData.chatTime || Date.now())
      }
    ];
  }, []);

  // 获取对话历史详情
  const fetchChatHistory = useCallback(async (chatId: string, actualUserName: string, currentAgent: any): Promise<ChatRecord[]> => {
    try {
      const chatInfoRequest: ChatInfoRequest = {
        agentCode: getAgentCode(currentAgent),
        pageNum: 1,
        pageSize: 20,
        chatId: chatId,
        userName: actualUserName
      };
      
      console.log('获取对话历史详情，参数:', chatInfoRequest);
      
      const response = await post<ChatInfoResponse>('rest/risk/control/manager/dataPlatform/chatInfo', chatInfoRequest);
      
      console.log('对话历史详情接口返回结果:', response);
      
      if (response?.status === 0 && response?.data?.data) {
        const chatRecords = response.data.data;
        const sortedRecords = chatRecords.sort((a, b) => 
          new Date(a.chatTime).getTime() - new Date(b.chatTime).getTime()
        );
        
        console.log(`成功获取${sortedRecords.length}条对话历史records`);
        return sortedRecords;
      } else {
        console.warn('获取对话历史详情失败:', response?.msg || '响应格式错误');
        return [];
      }
      
    } catch (error: any) {
      console.error('获取对话历史详情失败:', error);
      return [];
    }
  }, [getAgentCode]);

  // 检查Agent对话历史记录
  const checkAgentChatHistory = useCallback(async (currentAgent: any, actualUserName: string, generateWelcomeMessage: () => string) => {
    try {
      setIsLoadingHistory(true);
      
      const checkRequest: AgentChatCheckRequest = {
        agentCode: getAgentCode(currentAgent),
        userName: actualUserName
      };
      
      console.log('检查Agent对话历史records，参数:', checkRequest);
      
      const response = await post<AgentChatHistoryResponse>('/rest/risk/control/manager/dataPlatform/existAgentChat', checkRequest);
      
      console.log('历史records接口返回结果:', response);
      
      if (response?.status === 0 && response?.data) {
        const historyData = response.data;
        const chatId = historyData.chatId;
        const savedChatId = String(chatId);
        setCurrentChatId(savedChatId);

        console.log('历史records检查结果 - chatId:', savedChatId, '是否有效:', savedChatId !== '0');
        
        if (savedChatId !== '0' && savedChatId.trim() !== '') {
          console.log('发现历史会话，获取完整对话records...', savedChatId);
          
          const chatRecords = await fetchChatHistory(savedChatId, actualUserName, currentAgent);
          
          if (chatRecords.length > 0) {
            const historyMessages = buildHistoryMessages(chatRecords, generateWelcomeMessage);
            setMessages(historyMessages);
            console.log(`恢复${chatRecords.length}轮历史对话成功`);
            return;
          }
        }
        
        if (isValidHistoryData(historyData)) {
          console.log('使用单条record恢复模式，chatId:', savedChatId);
          const historyMessages = buildSingleHistoryMessages(historyData, generateWelcomeMessage);
          setMessages(historyMessages);
          console.log('恢复单条历史对话成功:', historyData);
        } else {
          console.log('历史数据无效或为空，显示默认欢迎消息');
          setCurrentChatId('0');
          const welcomeMessage: Message = {
            id: 'welcome-0',
            type: 'ai',
            content: generateWelcomeMessage(),
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        }
      } else {
        console.log('没有找到历史记录，开始新对话');
        setCurrentChatId('0');
        const welcomeMessage: Message = {
          id: 'welcome-0',
          type: 'ai',
          content: generateWelcomeMessage(),
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
      
    } catch (error: any) {
      console.error('检查Agent对话历史records失败:', error);
      
      setCurrentChatId('0');
      const welcomeMessage: Message = {
        id: 'welcome-0',
        type: 'ai',
        content: generateWelcomeMessage(),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [getAgentCode, fetchChatHistory, isValidHistoryData, buildHistoryMessages, buildSingleHistoryMessages]);

  // 调用聊天API
  const callChatAPI = useCallback(async (userInput: string, aiMessageId: string, currentAgent: any, actualUserName: string) => {
    try {
      const requestParams: ChatRequest = {
        question: userInput.trim(),
        workflowCode: getAgentCode(currentAgent),
        userName: actualUserName,
        chatId: currentChatId
      };

      console.log('调用聊天接口，参数:', requestParams);

      const response = await post<ChatResponse>('rest/risk/control/manager/dataPlatform/chat', requestParams);
      
      console.log('接口返回结果:', response);

      if (response?.data?.status === 0 && response?.data?.dataString) {
        const aiReplyContent = parseDataString(response.data.dataString);

        console.log('解析后的AI回复content:', aiReplyContent);

        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { 
                ...msg, 
                isGenerating: false,
                content: aiReplyContent
              }
            : msg
        ));
       } else {
        throw new Error(response?.data?.msg || 'AI回复格式错误');
      }
      
    } catch (error: any) {
      console.error('调用聊天接口失败:', error);
      
      const errorMessage = error.message || '网络请求失败，请重试';
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { 
              ...msg, 
              isGenerating: false,
              content: `❌ **调用AI服务失败**

**错误信息**: ${errorMessage}
**用户信息**: ${actualUserName}

请检查网络连接或稍后重试。您也可以尝试重新发送消息。

---
*如果问题持续存在，请联系技术支持*`
            }
          : msg
      ));
    }
  }, [currentChatId, getAgentCode]);

  // 发送消息
  const sendMessage = useCallback((userInput: string, currentAgent: any, actualUserName: string, onCreateHistorySession?: (title: string, agentName: string) => void) => {
    if (!userInput.trim()) return;

    const userInputContent = userInput.trim();

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: userInputContent,
      timestamp: new Date()
    };

    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isGenerating: true
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);

    // 创建历史会话标题
    if (messages.length === 1) {
      const sessionTitle = `${userInputContent.slice(0, 15)}${userInputContent.length > 15 ? '...' : ''} - ${currentAgent.name}`;
      if (onCreateHistorySession) {
        onCreateHistorySession(sessionTitle, currentAgent.name);
      }
    }

    // 调用API获取AI回复
    callChatAPI(userInputContent, aiMessage.id, currentAgent, actualUserName);
  }, [messages.length, callChatAPI]);

  return {
    messages,
    setMessages,
    currentChatId,
    setCurrentChatId,
    isLoadingHistory,
    checkAgentChatHistory,
    sendMessage,
    buildHistoryMessages,
    buildSingleHistoryMessages,
    fetchChatHistory
  };
}
