import vite from 'vite';

export default function ExitPlugin() {
   return {
    name: 'vite-plugin-exit', // 插件名称
    // 构建结束钩子（无论成功与否都会调用）
    buildEnd(error) {
      if (error) {
        console.error('构建失败:', error);
        process.exit(1); // 非零状态码表示失败
      } else {
        console.log('构建阶段结束，可能会继续执行其他钩子');
        // 通常不在这里退出，因为 closeBundle 可能还未调用
      }
    },
    // 当 Rollup 的 bundle 被写入后调用，通常标志构建最终完成
    closeBundle() {
      console.log('Bundle 已关闭，构建全部完成');
      setTimeout(() => {
        process.exit(0); // 成功退出
      }, 100); // 添加一个短暂的延迟，确保其他后续操作完成
    },
  };
}