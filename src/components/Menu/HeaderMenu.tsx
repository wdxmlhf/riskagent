import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const Layout: React.FC<{ className?: string | undefined; }> = ({ className }) => {

  {/* 顶部菜单，用户不需要时将其隐藏 */ }
  return (
    <Menu
      theme="light"
      mode="horizontal"
      className={className ?? ''}
      defaultSelectedKeys={['home']}
      items={[
        {
          key: 'home',
          icon: <Icon icon="mdi:home" />,
          label: <Link to="/">首页</Link>,
        },
        // 以下为示例，你可以将其删除
        {
          key: 'example1',
          icon: <Icon icon="mdi:home" />,
          label: <Link to="/example1">示例1</Link>,
        },
        {
          key: 'example2',
          icon: <Icon icon="mdi:home" />,
          label: <Link to="/example2_with_auth">示例2</Link>,
        },
        //其他页面的菜单可以写在这里
      ]}
    />
  );
};

export default Layout;
