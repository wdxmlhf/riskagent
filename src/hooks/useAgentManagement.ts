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

我将为您提供专业的流量分析和风险评估服务。

---

### 示例分析数据

以下是最近的流量质量分析数据：

| 账户ID | 业务类型 | 风险等级 | 退单率 | 异常流量占比 | 状态 |
|--------|---------|---------|--------|------------|------|
| ACC001 | 内循环 | 高危 | 45.2% | 32.1% | ⚠️ 需处理 |
| ACC002 | 外循环 | 中危 | 28.6% | 18.5% | ⚠️ 监控中 |
| ACC003 | 内循环 | 低危 | 12.3% | 5.2% | ✅ 正常 |
| ACC004 | 内循环 | 高危 | 52.8% | 41.3% | 🚨 紧急 |
| ACC005 | 外循环 | 低危 | 8.9% | 3.1% | ✅ 正常 |

**数据统计周期**: 2025-01-01 至 2025-01-31

**关键指标**:
- 总账户数: 156
- 高危账户: 23 (14.7%)
- 平均退单率: 24.5%
- 异常流量占比: 16.8%`,

      '联盟媒体分析': `## 联盟媒体风险分析助手

我专注于联盟媒体的流量质量分析，可以帮助您：

- 识别异常流量模式
- 分析媒体质量评估
- 提供风险预警建议
- 生成详细分析报告

请提供您需要分析的媒体信息或具体问题。

---

### 媒体质量评估示例

| 媒体ID | 媒体名称 | 流量评分 | 转化率 | 异常比例 | 评级 |
|--------|---------|---------|--------|---------|------|
| M1001 | 优质媒体A | 92 | 8.5% | 2.1% | ⭐⭐⭐⭐⭐ |
| M1002 | 普通媒体B | 76 | 5.2% | 8.3% | ⭐⭐⭐⭐ |
| M1003 | 风险媒体C | 45 | 2.1% | 35.6% | ⭐⭐ |
| M1004 | 优质媒体D | 88 | 7.8% | 3.5% | ⭐⭐⭐⭐⭐ |`,

      '聚量异常分析': `## 聚量异常检测助手

我可以帮助您进行聚量数据的异常检测和分析：

- 流量聚合异常识别
- 数据波动原因分析
- 异常模式挖掘
- 风险等级评估

请描述您遇到的聚量异常情况。

---

### 聚量数据异常监测

| 时间段 | 聚量值 | 预期范围 | 偏差率 | 异常类型 | 处理状态 |
|--------|--------|---------|--------|---------|---------|
| 01-15 08:00 | 15,230 | 10,000-12,000 | +26.9% | 突增 | 🔍 调查中 |
| 01-16 14:00 | 8,450 | 10,000-12,000 | -15.5% | 突降 | ✅ 已处理 |
| 01-17 10:00 | 18,920 | 10,000-12,000 | +57.7% | 异常峰值 | 🚨 待处理 |
| 01-18 09:00 | 11,200 | 10,000-12,000 | +1.8% | 正常波动 | ✅ 正常 |
| 01-19 16:00 | 6,780 | 10,000-12,000 | -32.2% | 异常低值 | ⚠️ 监控中 |`,

      '联盟私信链条分析': `## 私信链条关系分析

我专门分析联盟私信的传播链条和风险关系：

- 私信传播路径追踪
- 异常传播模式识别
- 风险节点定位
- 关系网络可视化

请提供需要分析的私信链条信息。

---

### 传播链条分析数据

| 节点ID | 用户类型 | 传播层级 | 下游节点数 | 风险指数 | 状态 |
|--------|---------|---------|-----------|---------|------|
| N001 | 源头账号 | L0 | 28 | 95 | 🚨 高危 |
| N002 | 二级传播 | L1 | 15 | 78 | ⚠️ 中危 |
| N003 | 二级传播 | L1 | 12 | 82 | ⚠️ 中危 |
| N004 | 三级传播 | L2 | 6 | 45 | ⚡ 低危 |
| N005 | 三级传播 | L2 | 8 | 52 | ⚡ 低危 |
| N006 | 四级传播 | L3 | 2 | 18 | ✅ 安全 |

**链条特征**:
- 总传播节点: 156
- 最大传播层级: L5
- 平均下游节点: 7.2
- 高危节点占比: 12.8%`
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
