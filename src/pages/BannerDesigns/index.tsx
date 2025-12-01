import React, { useState } from 'react';
import { Radio, Card, Space, Switch, Divider } from 'antd';
import TopBanner from '@/components/TopBanner';

const BannerDesigns = () => {
  const [selectedDesign, setSelectedDesign] = useState<number>(1);
  const [showPreview, setShowPreview] = useState<boolean>(true);

  const designs = [
    {
      id: 1,
      name: '标准样式 - 白色背景',
      description: '简洁专业，适合大多数场景',
      component: (
        <TopBanner
          platformName="智能对话平台"
          agentName="客服助手"
          backgroundColor="#ffffff"
          textColor="#333333"
        />
      )
    },
    {
      id: 2,
      name: '深色样式 - 黑色背景',
      description: '现代感强，适合科技产品',
      component: (
        <TopBanner
          platformName="AI平台"
          agentName="技术顾问"
          backgroundColor="#1a1a1a"
          textColor="#ffffff"
        />
      )
    },
    {
      id: 3,
      name: '品牌样式 - 渐变背景',
      description: '视觉效果突出，适合品牌推广',
      component: (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          height: '56px',
          position: 'relative'
        }}>
          <TopBanner
            platformName="创意AI"
            agentName="设计助手"
            backgroundColor="transparent"
            textColor="#ffffff"
          />
        </div>
      )
    },
    {
      id: 4,
      name: '极简样式 - 淡色背景',
      description: '低调优雅，不干扰内容',
      component: (
        <TopBanner
          platformName="知识库"
          agentName="学习助手"
          backgroundColor="#f5f7fa"
          textColor="#2c3e50"
        />
      )
    },
    {
      id: 5,
      name: '活力样式 - 彩色背景',
      description: '年轻活泼，适合娱乐应用',
      component: (
        <div style={{
          background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
          height: '56px',
          position: 'relative'
        }}>
          <TopBanner
            platformName="趣味AI"
            agentName="娱乐助手"
            backgroundColor="transparent"
            textColor="#ffffff"
          />
        </div>
      )
    }
  ];

  return (
    <div style={{ paddingTop: showPreview ? '72px' : '24px', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {showPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1001 }}>
          {designs.find(d => d.id === selectedDesign)?.component}
        </div>
      )}

      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1a1a1a' }}>
          顶部平台信息条设计方案
        </h1>
        <p style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
          用于外链页面顶部，展示平台logo和AI Agent信息
        </p>

        <Card style={{ marginBottom: 24 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 0 }}>实时预览</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 14, color: '#666' }}>固定在顶部</span>
                <Switch checked={showPreview} onChange={setShowPreview} />
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>选择设计方案</h3>
              <Radio.Group
                value={selectedDesign}
                onChange={(e) => setSelectedDesign(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {designs.map(design => (
                    <Radio key={design.id} value={design.id} style={{ width: '100%' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
                          {design.name}
                        </div>
                        <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 4 }}>
                          {design.description}
                        </div>
                      </div>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>
          </Space>
        </Card>

        <Card title="所有设计方案预览" style={{ marginBottom: 24 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {designs.map((design, index) => (
              <div key={design.id}>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#1a1a1a' }}>
                  方案 {index + 1}: {design.name}
                </h4>
                <p style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 16 }}>
                  {design.description}
                </p>
                <div style={{
                  border: '1px solid #e8e8e8',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  {design.component}
                </div>
              </div>
            ))}
          </Space>
        </Card>

        <Card title="组件使用说明">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>基本用法</h4>
              <pre style={{
                backgroundColor: '#f5f5f5',
                padding: '16px',
                borderRadius: '6px',
                fontSize: '13px',
                overflow: 'auto'
              }}>
{`import TopBanner from '@/components/TopBanner';

<TopBanner
  platformName="智能对话平台"
  agentName="客服助手"
  backgroundColor="#ffffff"
  textColor="#333333"
/>`}
              </pre>
            </div>

            <Divider />

            <div>
              <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>组件属性</h4>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li style={{ marginBottom: 8 }}>
                  <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>platformName</code>
                  <span style={{ color: '#666', marginLeft: 8 }}>平台名称（可选，默认：智能对话平台）</span>
                </li>
                <li style={{ marginBottom: 8 }}>
                  <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>platformLogo</code>
                  <span style={{ color: '#666', marginLeft: 8 }}>平台logo图片URL（可选）</span>
                </li>
                <li style={{ marginBottom: 8 }}>
                  <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>agentName</code>
                  <span style={{ color: '#666', marginLeft: 8 }}>AI Agent名称（必填）</span>
                </li>
                <li style={{ marginBottom: 8 }}>
                  <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>agentAvatar</code>
                  <span style={{ color: '#666', marginLeft: 8 }}>Agent头像URL（可选）</span>
                </li>
                <li style={{ marginBottom: 8 }}>
                  <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>backgroundColor</code>
                  <span style={{ color: '#666', marginLeft: 8 }}>背景颜色（可选，默认：#ffffff）</span>
                </li>
                <li>
                  <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>textColor</code>
                  <span style={{ color: '#666', marginLeft: 8 }}>文字颜色（可选，默认：#333333）</span>
                </li>
              </ul>
            </div>

            <Divider />

            <div>
              <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>设计特点</h4>
              <ul style={{ paddingLeft: '20px', margin: 0, color: '#666' }}>
                <li style={{ marginBottom: 6 }}>固定在页面顶部，始终可见</li>
                <li style={{ marginBottom: 6 }}>高度56px，符合常规顶部导航栏标准</li>
                <li style={{ marginBottom: 6 }}>响应式设计，自适应不同屏幕宽度</li>
                <li style={{ marginBottom: 6 }}>包含平台标识、Agent信息和来源标签</li>
                <li style={{ marginBottom: 6 }}>支持自定义logo和头像</li>
                <li>可自定义颜色主题以匹配品牌</li>
              </ul>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default BannerDesigns;
