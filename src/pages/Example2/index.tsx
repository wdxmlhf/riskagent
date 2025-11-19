import { UserStore } from '@/store/UserStore';
import React from 'react';
import { useSnapshot } from 'valtio';

const Example2: React.FC = () => {
  const { currentUser } = useSnapshot(UserStore)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">权限检查示例页面</h1>
        <p className="text-xl text-gray-600">你好, {currentUser?.name}, 你的角色是: [{currentUser?.roles.join(',') ?? ''}]</p>
      </div>
    </div>
  );
};

export default Example2;
