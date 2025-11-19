import { useState, useCallback } from 'react';
import { post } from '../common/axios';

// Agent相关接口类型定义
export interface AgentInfo {
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

interface FrequentAgentRequest {
  userName: string;
}

interface FrequentAgentResponse {
  status: number;
  msg: string;
  data: AgentInfo[];
  requestId: string;
}

// Agent分类配置
interface CategoryConfig {
  code: string;
  displayName: string;
}

const categoryConfigs: CategoryConfig[] = [
  { code: 'riskAware', displayName: '风险感知Agent' },
  { code: 'riskAttribution', displayName: '风险归因Agent' },
  { code: 'riskIdentify', displayName: '风险识别Agent' },
  { code: 'riskData', displayName: '数据Agent' }
];

export function useAgentManagement() {
  const [frequentAgents, setFrequentAgents] = useState<any[]>([]);
  const [frequentAgentsLoading, setFrequentAgentsLoading] = useState(false);

  // 根据category code获取对应的中文显示名称
  const getCategoryDisplayName = useCallback((categoryCode: string): string => {
    const config = categoryConfigs.find(c => c.code === categoryCode);
    return config ? config.displayName : categoryCode || '智能助手';
  }, []);

  // 获取Agent显示名称的辅助函数
  const getAgentDisplayName = useCallback((agentData: any): string => {
    return agentData?.agentName || agentData?.name || '未知Agent';
  }, []);

  // 根据agentCode分配渐变色
  const getAgentGradient = useCallback((agentCode: string): string => {
    const gradients = [
      'from-pink-400 to-purple-500',
      'from-blue-400 to-purple-500', 
      'from-purple-400 to-pink-500',
      'from-green-400 to-blue-500',
      'from-yellow-400 to-red-500',
      'from-indigo-400 to-purple-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < agentCode.length; i++) {
        hash = agentCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  }, []);

  // 获取常用Agent列表
  const fetchFrequentAgents = useCallback(async (userName: string) => {
    if (!userName || frequentAgents.length > 0) {
      console.log('常用Agent已存在或用户名为空，跳过重复获取');
      return;
    }

    setFrequentAgentsLoading(true);

    try {
      const requestParams: FrequentAgentRequest = {
        userName: userName
      };

      console.log('获取常用Agent，参数:', requestParams);
      
      const response = await post<FrequentAgentResponse>('/rest/risk/control/manager/dataPlatform/frequentlyAgentList', requestParams);

      if (response?.status === 0) {
        const agentInfos = response.data || [];
        
        const transformedData = agentInfos.map((item) => ({
          id: item.agentCode,
          name: item.agentName,
          agentName: item.agentName,
          description: item.agentDescription || '专业的AI助手',
          category: item.agentCategory,
          author: item.agentManager || '未知',
          agentCode: item.agentCode,
          agentBelong: item.agentBelong,
          agentIcon: item.agentIcon,
          status: item.status,
          gradient: getAgentGradient(item.agentCode)
        }));
        
        console.log(`成功获取${transformedData.length}个常用Agent`);
        setFrequentAgents(transformedData);
      } else {
        throw new Error(response?.msg || '获取常用Agent失败');
      }
    } catch (err: any) {
      console.error('获取常用Agent失败:', err);
      setFrequentAgents([]);
    } finally {
      setFrequentAgentsLoading(false);
    }
  }, [frequentAgents.length, getAgentGradient]);

  // 生成个性化的欢迎消息
  const generatePersonalizedWelcome = useCallback((agentData: any): string => {
    const agentName = getAgentDisplayName(agentData);
    const category = agentData?.category || '智能助手';
    const description = agentData?.description || '为您提供专业的AI服务';
    
    return `## ${agentName}

您好！我是您的${getCategoryDisplayName(category)}。

${description}

请告诉我您需要什么帮助？`;
  }, [getAgentDisplayName, getCategoryDisplayName]);

  // 生成Agent欢迎消息的函数
  const generateWelcomeMessage = useCallback((currentAgent: any) => {
    const agentSpecificContent = {
      '小店追单': `## 分流分析下探助手

我是您的流量质量case排查助手，请您按照以下格式输入待排查信息查询对象：

**查询对象**: XXXXXXXX
**对象类型**: 账户id/买家id/作者id  
**业务类型**: 内循环
**风险类型**: 小店追单类
**风险场景**: 高退单率
**查询周期**: 20250XX-20250XXX
**资源位**: 激励视频/信息流/搜索/广告/开屏/联盟/内容热条/微信小程序

我将为您提供专业的流量分析和风险评估服务。`,

      '联盟媒体分析': `## 联盟媒体风险分析助手

我专注于联盟媒体的流量质量分析，可以帮助您：

- 识别异常流量模式
- 分析媒体质量评估
- 提供风险预警建议
- 生成详细分析报告

请提供您需要分析的媒体信息或具体问题。`,

      '聚量异常分析': `## 聚量异常检测助手

我可以帮助您进行聚量数据的异常检测和分析：

- 流量聚合异常识别
- 数据波动原因分析
- 异常模式挖掘
- 风险等级评估

请描述您遇到的聚量异常情况。`,

      '联盟私信链条分析': `## 私信链条关系分析

我专门分析联盟私信的传播链条和风险关系：

- 私信传播路径追踪
- 异常传播模式识别
- 风险节点定位
- 关系网络可视化

请提供需要分析的私信链条信息。`
    };

    const name = getAgentDisplayName(currentAgent);
    return agentSpecificContent[name as keyof typeof agentSpecificContent] || 
           `## ${name}

您好！我是您的${getCategoryDisplayName(currentAgent.category)}智能助手。

${currentAgent.description}

请告诉我您需要什么帮助？`;
  }, [getAgentDisplayName, getCategoryDisplayName]);

  return {
    frequentAgents,
    frequentAgentsLoading,
    fetchFrequentAgents,
    getCategoryDisplayName,
    getAgentDisplayName,
    getAgentGradient,
    generatePersonalizedWelcome,
    generateWelcomeMessage
  };
}
