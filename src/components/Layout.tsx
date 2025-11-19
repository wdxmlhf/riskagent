import React from 'react';
import { Layout as AntLayout, ConfigProvider, Typography } from 'antd';
import reactLogo from '../assets/react.svg';
import { useSnapshot } from 'valtio';
import { UserStore } from '@/store/UserStore';
import { gotoLoginWithSSO } from '@/integrations/ambase';
import HeaderMenu from './Menu/HeaderMenu';

const { Header, Content } = AntLayout;
const { Title } = Typography;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const { currentUser } = useSnapshot(UserStore);

  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerHeight: 48, //顶部导航高度
            headerBg: '#fff', //顶部导航背景色
            headerColor: '#000', //顶部导航文字颜色
          },
        },
      }}
    >
      <AntLayout style={{ minHeight: '100vh' }}>
        {/* 网站Header */}
        <Header className="flex !px-[20px]">
          {/* 此处定义logo和title */}
          <div className="flex items-center mr-[20px]">
            <img src={reactLogo} className="!h-6 !w-6 !mr-4" />
            <Title level={5} className="!m-0">
              站点名称
            </Title>
          </div>
          <div className='flex-grow flex-shrink'>
            {/* 顶部菜单 */}
            <HeaderMenu className='w-full' />
          </div>

          {/* 登录的用户信息 */}
          <div className={`flex items-center transition-opacity duration-500 ease-in-out`}>
            <img src={currentUser?.thumbnailAvatarUrl ?? reactLogo} className={'h-6 w-6 mr-1 rounded-full'} />
            {currentUser ? currentUser?.name : <span className="text-gray-500 cursor-pointer" onClick={gotoLoginWithSSO}>点击登录</span>}
          </div>

        </Header>
        <Content className="w-full h-full p-0">{children}</Content>
      </AntLayout>
    </ConfigProvider>
  );
};

export default Layout;