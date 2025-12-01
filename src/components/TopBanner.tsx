import React from 'react';
import { RobotOutlined } from '@ant-design/icons';

interface TopBannerProps {
  platformName?: string;
  platformLogo?: string;
  agentName: string;
  agentAvatar?: string;
  backgroundColor?: string;
  textColor?: string;
}

const TopBanner: React.FC<TopBannerProps> = ({
  platformName = '智能对话平台',
  platformLogo,
  agentName,
  agentAvatar,
  backgroundColor = '#ffffff',
  textColor = '#333333'
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        backgroundColor,
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {platformLogo ? (
          <img
            src={platformLogo}
            alt={platformName}
            style={{
              height: '32px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        ) : (
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: textColor,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RobotOutlined style={{ fontSize: '24px' }} />
            {platformName}
          </div>
        )}

        <div
          style={{
            height: '24px',
            width: '1px',
            backgroundColor: '#d9d9d9'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {agentAvatar ? (
            <img
              src={agentAvatar}
              alt={agentName}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#1890ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {agentName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: textColor,
                lineHeight: '20px'
              }}
            >
              {agentName}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#8c8c8c',
                lineHeight: '16px'
              }}
            >
              AI Agent
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontSize: '12px',
            color: '#8c8c8c',
            padding: '4px 12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '12px'
          }}
        >
          由 {platformName} 生成
        </span>
      </div>
    </div>
  );
};

export default TopBanner;
