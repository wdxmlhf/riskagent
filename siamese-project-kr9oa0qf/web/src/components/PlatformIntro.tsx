import React from 'react';
import { ArrowLeft, Shield, Brain, BarChart3, Users, Search, Zap, Lock, Globe } from 'lucide-react';

interface PlatformIntroProps {
  onBack: () => void;
}

export default function PlatformIntro({ onBack }: PlatformIntroProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://p4-ad.adkwai.com/udata/pkg/ks-ad-fe/riskagentBG.png"
          alt="background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-transparent border-b border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-300 hover:text-blue-400 mr-6 transition-all hover:scale-105 font-medium"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                返回首页
              </button>
              <div className="flex items-center">
                <img src="https://p4-ad.adkwai.com/udata/pkg/ks-ad-fe/Vector.png" alt="RiskAgent Logo" className="w-10 h-10 mr-3" />
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">RiskAgent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-white py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-8">
            <img src="https://p4-ad.adkwai.com/udata/pkg/ks-ad-fe/Vector.png" alt="RiskAgent Logo" className="w-24 h-24 mr-8" />
            <h1 className="text-7xl font-bold tracking-tight">RiskAgent</h1>
          </div>
          <p className="text-3xl opacity-90 mb-10 font-medium">智能风控决策平台</p>
          <p className="text-xl opacity-80 max-w-4xl mx-auto font-medium leading-relaxed">
            基于人工智能技术，为企业提供全方位的风险控制解决方案，
            通过对话式交互让风控决策更加智能、高效、精准
          </p>
        </div>
      </div>

      {/* Core Features */}
      <div className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-6">核心功能</h2>
            <p className="text-2xl text-gray-300 font-medium">全面覆盖风控场景，智能化决策支持</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 流量分析 */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-600/50">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-5">流量分析</h3>
              <p className="text-gray-300 mb-8 font-medium leading-relaxed">
                实时监控用户行为，识别异常流量模式，预测潜在风险，
                为业务决策提供数据支撑
              </p>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                <li>• 实时流量监控与异常检测</li>
                <li>• 用户行为轨迹分析</li>
                <li>• 风险趋势预测</li>
              </ul>
            </div>

            {/* 数据查询 */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-600/50">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-5">智能数据查询</h3>
              <p className="text-gray-300 mb-8 font-medium leading-relaxed">
                通过自然语言查询复杂数据，快速获取关键信息，
                支持多维度数据分析和可视化展示
              </p>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                <li>• 自然语言查询接口</li>
                <li>• 多维度数据分析</li>
                <li>• 可视化报表生成</li>
              </ul>
            </div>

            {/* 团组关系 */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-600/50">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-5">团组关系分析</h3>
              <p className="text-gray-300 mb-8 font-medium leading-relaxed">
                深度挖掘用户关联关系，识别可疑团伙组织，
                构建完整的风险网络图谱
              </p>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                <li>• 关联关系挖掘</li>
                <li>• 团伙组织识别</li>
                <li>• 风险网络可视化</li>
              </ul>
            </div>

            {/* AI助手 */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-600/50">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-5">智能分析助手</h3>
              <p className="text-gray-300 mb-8 font-medium leading-relaxed">
                基于机器学习算法，提供智能化风险评估，
                自动生成分析报告和决策建议
              </p>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                <li>• 智能风险评估</li>
                <li>• 自动化报告生成</li>
                <li>• 决策建议推荐</li>
              </ul>
            </div>

            {/* 实时监控 */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-600/50">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-green-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-5">实时风控</h3>
              <p className="text-gray-300 mb-8 font-medium leading-relaxed">
                毫秒级风险识别与响应，实时拦截可疑交易，
                保障业务安全稳定运行
              </p>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                <li>• 毫秒级风险识别</li>
                <li>• 实时交易拦截</li>
                <li>• 自动化风控策略</li>
              </ul>
            </div>

            {/* 安全合规 */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-600/50">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-5">安全合规</h3>
              <p className="text-gray-300 mb-8 font-medium leading-relaxed">
                严格遵循数据安全标准，确保用户隐私保护，
                满足各类合规要求
              </p>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                <li>• 数据加密传输</li>
                <li>• 隐私保护机制</li>
                <li>• 合规审计支持</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Advantages */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-6">平台优势</h2>
            <p className="text-2xl text-gray-300 font-medium">为什么选择RiskAgent</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">AI驱动</h3>
              <p className="text-gray-300 font-medium leading-relaxed">
                基于先进的人工智能技术，持续学习优化，
                提供更精准的风险识别和预测能力
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">高效便捷</h3>
              <p className="text-gray-300 font-medium leading-relaxed">
                对话式交互界面，降低使用门槛，
                让复杂的风控分析变得简单易用
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">全面覆盖</h3>
              <p className="text-gray-300 font-medium leading-relaxed">
                覆盖风控全流程，从数据分析到决策执行，
                提供一站式风控解决方案
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-white mb-8 tracking-tight">开始使用RiskAgent</h2>
          <p className="text-2xl text-white/90 mb-12 font-medium">
            立即体验智能风控的强大功能，让数据驱动您的决策
          </p>
          <button
            onClick={onBack}
            className="bg-gray-800/95 backdrop-blur-sm text-blue-400 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-gray-700 transition-all shadow-2xl hover:shadow-3xl hover:scale-105"
          >
            立即开始
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}