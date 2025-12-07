import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface AppNavbarProps {
  isLoggedIn?: boolean;
  username?: string;
  onLogout?: () => void;
}

const AppNavbar: React.FC<AppNavbarProps> = ({ isLoggedIn = false, username = '', onLogout }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-transparent border-b border-gray-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button onClick={() => handleNavigate('/')} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img src="https://p4-ad.adkwai.com/udata/pkg/ks-ad-fe/Vector.png" alt="RiskAgent Logo" className="w-10 h-10" />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">RiskAgent</span>
            </button>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => handleNavigate('/')}
                className="text-gray-300 hover:text-blue-400 text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                首页
              </button>
              <button
                onClick={() => handleNavigate('/my-agents')}
                className="text-gray-300 hover:text-blue-400 text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                我的 Agent
              </button>
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-300">欢迎，{username}</span>
                  <button
                    onClick={onLogout}
                    className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNavigate('/login')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  登录
                </button>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-blue-400 p-2 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
              <button
                onClick={() => handleNavigate('/')}
                className="text-gray-300 hover:text-blue-400 block px-3 py-2 rounded-lg text-base font-medium w-full text-left transition-colors"
              >
                首页
              </button>
              <button
                onClick={() => {
                  handleNavigate('/my-agents');
                  setIsMobileMenuOpen(false);
                }}
                className="text-gray-300 hover:text-blue-400 block px-3 py-2 rounded-lg text-base font-medium w-full text-left transition-colors"
              >
                我的 Agent
              </button>
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-gray-300 text-base">欢迎，{username}</div>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-2 rounded-lg text-base font-medium transition-all"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNavigate('/login')}
                  className="w-full text-left bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 rounded-lg text-base font-medium transition-all"
                >
                  登录
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AppNavbar;
