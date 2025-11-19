# My React App

基于 Vite + React + TypeScript 的项目模板

## 特性

- ⚡️ Vite 构建，快速的冷启动和热更新
- 🔥 最新的 React 18
- 🎨 TypeScript 支持
- 📦 组件自动导入
- 🎯 路由自动生成
- 🎨 CSS Modules 支持
- 📱 响应式设计
- 🔍 打包分析

## 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 构建

```bash
# 构建测试环境
npm run build

# 构建生产环境
npm run build:prod

# 预览构建产物
npm run preview

# 构建分析
npm run analyze
```

## 目录结构

```
├── public/             # 静态资源
├── src/                # 源代码
│   ├── api/            # API 接口
│   ├── assets/         # 静态资源
│   ├── common/         # 公共函数
│   ├── components/     # 公共组件
│   ├── pages/          # 页面组件
│   ├── router/         # 路由配置
│   ├── store/          # 状态管理
│   ├── styles/         # 全局样式
│   ├── utils/          # 工具函数
│   ├── App.tsx         # 根组件
│   └── main.tsx        # 入口文件
├── .env               # 环境变量
├── .env.production    # 生产环境变量
├── .env.analyze       # 分析环境变量
├── vite.config.ts     # Vite 配置
└── package.json       # 项目配置
```

## 构建优化

- 🔥 代码分割
- 📦 静态资源压缩
- 🎯 Tree Shaking
- 🔍 构建产物分析
- 🚀 Legacy 浏览器支持
- 📱 图片压缩和优化

## 环境变量

- `VITE_APP_TITLE`: 应用标题
- `VITE_APP_ENV`: 环境标识
- `VITE_APP_BASE_API`: API 基础路径
- `VITE_APP_PUBLIC_PATH`: 公共路径
- `VITE_APP_COMPRESS`: 是否启用 Gzip 压缩
- `VITE_DROP_CONSOLE`: 是否移除 console
- `VITE_APP_ANALYZE`: 是否启用打包分析