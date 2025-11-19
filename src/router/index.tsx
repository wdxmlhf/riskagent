import React from 'react';
import { Route, Routes, HashRouter } from 'react-router-dom';
import Home from '../pages/Home/index';
import Example1 from '../pages/Example1';
import Example2 from '../pages/Example2';

import Layout from '../components/Layout';

import AuthenticatedLayout from '@/components/AuthenticatedLayout';

// 路由系统基于`react-router-dom`V6版本实现
const AppRouter = () => {
  return (
    <HashRouter>
      <Routes>
        {/* 主页默认允许匿名访问 */}
        <Route path="/" element={<AuthenticatedLayout authParams={{ allowAnonymous: true }} ><Home /></AuthenticatedLayout>} />

        {/* 以下为示例，你可以将其删除 */}
        <Route path="/example1" element={<AuthenticatedLayout authParams={{ allowAnonymous: true }} ><Layout><Example1 /></Layout></AuthenticatedLayout>} />
        {/* 包含权限检查的页面示例，allowAnonymous表示是否可以匿名访问 默认允许匿名访问；allowRoles表示可以访问页面的角色，未定义时任何角色均可访问 */}
        <Route path="/example2_with_auth" element={<AuthenticatedLayout autoLogin={true} authParams={{ allowAnonymous: false, allowRoles: ['admin'] }}><Example2 /></AuthenticatedLayout>} />
      </Routes>
    </HashRouter>
  );
};

export default AppRouter;
