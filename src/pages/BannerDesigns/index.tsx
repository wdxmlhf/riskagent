import React, { useState } from 'react';
import { Alert, Radio, Card, Space } from 'antd';
import { InfoCircleOutlined, WarningOutlined, CheckCircleOutlined, CloseCircleOutlined, BellOutlined, GiftOutlined, ThunderboltOutlined, RocketOutlined, StarOutlined } from '@ant-design/icons';

const BannerDesigns = () => {
  const [selectedDesign, setSelectedDesign] = useState<number>(1);

  const designs = [
    {
      id: 1,
      name: '简约信息条',
      component: (
        <Alert
          message="系统升级通知"
          description="我们将在今晚22:00-24:00进行系统维护，期间服务可能短暂中断。"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          closable
          style={{ marginBottom: 16 }}
        />
      )
    },
    {
      id: 2,
      name: '渐变背景条',
      component: (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: 16,
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          <GiftOutlined style={{ fontSize: 24 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
              新用户专享福利
            </div>
            <div style={{ fontSize: 14, opacity: 0.95 }}>
              注册即送500积分，立即体验高级功能
            </div>
          </div>
          <button style={{
            background: 'white',
            color: '#667eea',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            立即领取
          </button>
        </div>
      )
    },
    {
      id: 3,
      name: '成功状态条',
      component: (
        <Alert
          message="操作成功"
          description="您的数据已成功保存，可以继续下一步操作。"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          closable
          style={{ marginBottom: 16 }}
        />
      )
    },
    {
      id: 4,
      name: '警告提示条',
      component: (
        <Alert
          message="重要提醒"
          description="检测到您的账户在异地登录，请确认是否为本人操作。"
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          action={
            <button style={{
              background: '#faad14',
              color: 'white',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500
            }}>
              立即查看
            </button>
          }
          closable
          style={{ marginBottom: 16 }}
        />
      )
    },
    {
      id: 5,
      name: '动态通知条',
      component: (
        <div style={{
          background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: 16,
          boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'shimmer 2s infinite'
          }} />
          <ThunderboltOutlined style={{ fontSize: 24, zIndex: 1 }} />
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
              限时活动进行中
            </div>
            <div style={{ fontSize: 14, opacity: 0.95 }}>
              仅剩最后3小时，错过再等一年！
            </div>
          </div>
          <button style={{
            background: 'white',
            color: '#f5576c',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            zIndex: 1
          }}>
            参与活动
          </button>
          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1a1a1a' }}>
        顶部信息条设计方案
      </h1>
      <p style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
        5种不同风格的顶部通知栏设计，适用于各种场景
      </p>

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>选择设计方案</h3>
            <Radio.Group
              value={selectedDesign}
              onChange={(e) => setSelectedDesign(e.target.value)}
              buttonStyle="solid"
            >
              {designs.map(design => (
                <Radio.Button key={design.id} value={design.id}>
                  {design.name}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>

          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>预览效果</h3>
            {designs.find(d => d.id === selectedDesign)?.component}
          </div>
        </Space>
      </Card>

      <Card title="所有设计方案" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {designs.map((design, index) => (
            <div key={design.id}>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1a1a1a' }}>
                方案 {index + 1}: {design.name}
              </h4>
              {design.component}
            </div>
          ))}
        </Space>
      </Card>

      <Card title="使用场景说明">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <h4 style={{ fontWeight: 600 }}>1. 简约信息条</h4>
            <p style={{ color: '#666', marginBottom: 0 }}>
              适用于：系统通知、一般信息提示、可关闭的提醒
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600 }}>2. 渐变背景条</h4>
            <p style={{ color: '#666', marginBottom: 0 }}>
              适用于：营销活动、新功能推广、用户福利通知
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600 }}>3. 成功状态条</h4>
            <p style={{ color: '#666', marginBottom: 0 }}>
              适用于：操作成功反馈、任务完成提示、正面确认信息
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600 }}>4. 警告提示条</h4>
            <p style={{ color: '#666', marginBottom: 0 }}>
              适用于：安全警告、重要提醒、需要用户注意的信息
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600 }}>5. 动态通知条</h4>
            <p style={{ color: '#666', marginBottom: 0 }}>
              适用于：限时活动、紧急通知、吸引用户注意的重要信息
            </p>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default BannerDesigns;
