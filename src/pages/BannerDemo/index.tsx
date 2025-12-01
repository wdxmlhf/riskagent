import React from 'react';
import TopBanner from '@/components/TopBanner';
import { Card } from 'antd';

const BannerDemo = () => {
  const mockMessage = `# 📊 账户诊断报告

## 📋 账户基本信息
- **账户ID**: 12345678
- **账户类型**: 企业账户
- **注册时间**: 2023-01-15
- **最近活跃**: 2025-12-01 10:30:25

---

## 🎯 核心排查结论
经过系统自动化分析，发现以下问题：

1. **风险等级**: 中等
2. **异常行为检测**: 发现2处异常
3. **建议操作**: 需要人工审核

---

## 🎯 核心排查明细
### 1.81136570
<a href="https://riskagent/content/81136570">https://riskagent/content/81136570排查报告</a>

### 2.80635671
<a href="https://riskagent/content/80635671">https://riskagent/content/80635671排查报告</a>

---

## 📌 后续建议
1. 请尽快查看详细排查报告
2. 如有疑问，请联系风控团队
3. 建议在24小时内完成审核`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <TopBanner
        platformName="风险管理平台"
        agentName="风控诊断Agent"
        backgroundColor="#ffffff"
        textColor="#333333"
      />

      <div style={{ paddingTop: '72px', padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Card
          title="AI Agent 对话消息预览"
          extra={<span style={{ fontSize: 12, color: '#8c8c8c' }}>模拟真实对话场景</span>}
          style={{ marginBottom: 24 }}
        >
          <div style={{ display: 'flex', gap: '16px', marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                marginBottom: 16
              }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                  <strong>用户:</strong>
                </div>
                <div style={{ fontSize: 14, color: '#333' }}>
                  请帮我诊断一下账户 12345678 的风险情况
                </div>
              </div>

              <div style={{
                padding: '16px 20px',
                backgroundColor: '#e6f7ff',
                borderRadius: '8px',
                border: '1px solid #91d5ff'
              }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#1890ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    风
                  </div>
                  <strong>风控诊断Agent:</strong>
                </div>

                <div style={{
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: '#333'
                }}>
                  <div dangerouslySetInnerHTML={{
                    __html: mockMessage
                      .replace(/^# (.+)$/gm, '<h1 style="font-size: 24px; font-weight: 700; margin: 16px 0 12px 0; color: #1a1a1a;">$1</h1>')
                      .replace(/^## (.+)$/gm, '<h2 style="font-size: 18px; font-weight: 600; margin: 14px 0 10px 0; color: #1a1a1a;">$1</h2>')
                      .replace(/^### (.+)$/gm, '<h3 style="font-size: 16px; font-weight: 600; margin: 12px 0 8px 0; color: #1a1a1a;">$1</h3>')
                      .replace(/^\*\*(.+?)\*\*:/gm, '<strong style="color: #1a1a1a;">$1:</strong>')
                      .replace(/^- (.+)$/gm, '<li style="margin: 6px 0; padding-left: 4px;">$1</li>')
                      .replace(/^(\d+)\. (.+)$/gm, '<div style="margin: 8px 0; padding-left: 4px;"><strong>$1.</strong> $2</div>')
                      .replace(/^---$/gm, '<hr style="margin: 16px 0; border: none; border-top: 1px solid #e8e8e8;" />')
                      .replace(/<a href="(.+?)">(.+?)<\/a>/g, '<a href="$1" style="color: #1890ff; text-decoration: none; border-bottom: 1px solid #1890ff;" target="_blank" rel="noopener noreferrer">$2</a>')
                      .replace(/\n\n/g, '<br /><br />')
                      .replace(/\n/g, '<br />')
                  }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#fffbe6',
            borderRadius: '8px',
            border: '1px solid #ffe58f',
            fontSize: 13,
            color: '#666'
          }}>
            <strong style={{ color: '#fa8c16' }}>💡 提示：</strong> 这是一个模拟的AI对话场景，展示了带有平台信息条的页面效果。实际使用时，顶部会固定显示平台logo和Agent名称。
          </div>
        </Card>

        <Card title="不同样式预览">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>标准样式（当前使用）</h4>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
                <TopBanner
                  platformName="风险管理平台"
                  agentName="风控诊断Agent"
                  backgroundColor="#ffffff"
                  textColor="#333333"
                />
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>深色样式</h4>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
                <TopBanner
                  platformName="风险管理平台"
                  agentName="风控诊断Agent"
                  backgroundColor="#1a1a1a"
                  textColor="#ffffff"
                />
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>品牌渐变样式</h4>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <TopBanner
                    platformName="风险管理平台"
                    agentName="风控诊断Agent"
                    backgroundColor="transparent"
                    textColor="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BannerDemo;
