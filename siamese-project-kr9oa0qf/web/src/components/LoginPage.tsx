import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { ambase } from '../integrations/ambase';
import { UserStore } from '../store/UserStore';
import { useSnapshot } from 'valtio';

interface LoginPageProps {
  onBack: () => void;
  onLogin: (username: string) => void;
  redirectMessage?: string;
}

export default function LoginPage({ onBack, onLogin, redirectMessage }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSSO, setIsLoadingSSO] = useState(false);
  const [isAutoLogging, setIsAutoLogging] = useState(false); // 自动登录状态
  const [error, setError] = useState('');

  // 获取SSO用户信息
  const { currentUser } = useSnapshot(UserStore);

  // 获取SSO用户名的函数
  const getSSOUserName = async () => {
    try {
      setIsLoadingSSO(true);
      console.log('开始获取SSO用户信息...');

      // 检查是否已有用户信息
      if (currentUser && currentUser.username) {
        console.log('发现已缓存的SSO用户信息:', currentUser.username);
        return currentUser.username;
      }

      // 尝试从ambase获取用户信息
      const userInfo = await ambase.auth.getCurrentUserInfo();
      if (userInfo && userInfo.username) {
        // 更新UserStore中的用户信息
        UserStore.currentUser = userInfo;
        console.log('成功获取SSO用户信息:', userInfo.username);
        return userInfo.username;
      }

      console.log('未获取到有效的SSO用户信息');
      return null;

    } catch (error: any) {
      console.warn('获取SSO用户信息失败:', error.message || error);
      return null;
    } finally {
      setIsLoadingSSO(false);
    }
  };

  // 自动填充SSO用户名
  const autoFillSSOUsername = async () => {
    const ssoUsername = await getSSOUserName();
    
    if (ssoUsername) {
      console.log('自动填充SSO用户名:', ssoUsername);
      // 同时设置用户名和密码为SSO用户名
      setUsername(ssoUsername);
      setPassword(ssoUsername);
      
      // 自动填充成功后立即触发自动登录
      console.log('开始自动登录流程...');
      await performAutoLogin(ssoUsername);
    } else {
      console.log('未能获取SSO用户名，保持空值状态');
    }
  };
  
  // 执行自动登录
  const performAutoLogin = async (ssoUsername: string) => {
    try {
      setIsAutoLogging(true);
      console.log('执行自动登录，用户名:', ssoUsername);
      
      // 短暂延迟，让用户看到自动填充的内容
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 调用登录函数，传入SSO用户名
      await onLogin(ssoUsername);
    } catch (error: any) {
      console.error('自动登录失败:', error);
      setError('自动登录失败，请手动登录');
    } finally {
      setIsAutoLogging(false);
    }
  };
  
  // 组件加载时自动获取SSO用户信息
  useEffect(() => {
    // 只在用户名和密码都为空时才自动填充
    if (!username && !password) {
      autoFillSSOUsername();
    }
  }, []); // 只在组件首次加载时执行

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 如果正在自动登录，阻止手动提交
    if (isAutoLogging) return;
    
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setIsLoading(true);
    
    // 模拟登录请求
    setTimeout(() => {
      // 简单的模拟登录验证
      if (username.trim() && password.trim()) {
        onLogin(username);
      } else {
        setError('用户名或密码错误');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img src="https://p4-ad.adkwai.com/udata/pkg/ks-ad-fe/Vector.png" alt="RiskAgent Logo" className="w-16 h-16 mr-4" />
            <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">RiskAgent</span>
          </div>
          <div className="flex items-center justify-center mb-2">
            {isLoadingSSO && !isAutoLogging && (
              <div className="flex items-center text-sm text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                正在获取用户信息...
              </div>
            )}
            {isAutoLogging && (
              <div className="flex items-center text-sm text-green-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
                正在自动登录...
              </div>
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">登录您的账户</h2>
          {redirectMessage && (
            <p className="text-sm text-blue-400 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 px-6 py-3 rounded-xl font-medium shadow-sm border border-blue-600/50">
              {redirectMessage}
            </p>
          )}
          {isAutoLogging && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl border border-green-600/50">
              <p className="text-sm text-green-300 font-medium text-center">
                <strong>自动登录中：</strong>已获取到您的SSO信息，正在为您登录...
              </p>
            </div>
          )}
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-gray-600/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-600/50 text-red-400 px-6 py-4 rounded-xl text-sm font-medium shadow-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-200 mb-3">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium bg-gray-700/50 focus:bg-gray-700 shadow-sm text-white placeholder-gray-400"
                placeholder={isLoadingSSO ? "正在获取用户信息..." : isAutoLogging ? "已自动填充" : "请输入用户名"}
                disabled={isLoading || isAutoLogging}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-3">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 pr-14 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium bg-gray-700/50 focus:bg-gray-700 shadow-sm text-white placeholder-gray-400"
                  placeholder={isLoadingSSO ? "正在获取用户信息..." : isAutoLogging ? "已自动填充" : "请输入密码"}
                  disabled={isLoading || isAutoLogging}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors hover:scale-110"
                  disabled={isLoading || isAutoLogging}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isAutoLogging}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 disabled:scale-100"
            >
              {isAutoLogging ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  自动登录中...
                </span>
              ) : isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-gray-300 hover:text-blue-400 text-sm transition-colors font-medium hover:scale-105"
            >
              返回首页
            </button>
          </div>
        </div>

        {/* Demo Info */}
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-blue-600/50">
          <p className="text-sm text-blue-300 font-medium">
            <strong>演示提示：</strong>
            {currentUser && currentUser.username ? (
              isAutoLogging ? 
                `正在使用SSO用户信息 (${currentUser.username}) 自动登录...` :
                `已自动填充SSO用户信息 (${currentUser.username})，或者可手动输入其他用户名和密码`
            ) : (
              '系统会尝试自动获取您的SSO用户信息，或者您可以手动输入用户名和密码'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
