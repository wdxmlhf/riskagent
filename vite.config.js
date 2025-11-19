import { defineConfig } from 'vite'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import ExitPlugin from './babel-plugins/vite-plugin-exit';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production'
  const cdnUrl = '//p2-ad.adkwai.com/bs2/ad-automate-cdn/project/177/'

  console.log('mode', mode, 'command', command)

  const reactWithLoc = react({
    babel: {
      root: resolve(__dirname, 'src'),
      presets: [
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]
      ],
      plugins: [
        [
          resolve(__dirname, 'babel-plugins/jsx-dom-loc.cts')
        ]
      ],
      // 确保保留位置信息
      retainLines: true,
      compact: false
    }
  })

  return {
    base: isProd ? cdnUrl : '/',
    plugins: [
      reactWithLoc,
      isProd ?  ExitPlugin() : null,
      legacy({
        targets: ['ie >= 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        polyfills: true,
        renderLegacyChunks: true,
        modernPolyfills: true
      })
    ],
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      },
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer({
            overrideBrowserslist: ['> 1%', 'last 2 versions']
          })
        ]
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'antd', 'axios', 'valtio'],
      exclude: ['@vitejs/plugin-legacy']
    },
    build: {
      outDir: 'dist',
      assetsDir: '',
      target: 'es2020',
      minify: 'esbuild',
      cacheDir: './.vite_cache',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      polyfillDynamicImport: false,
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        output: {
          //am的上传文件不支持目录。所以这里全部放在根目录下
          chunkFileNames: '[name]-[hash].js',
          entryFileNames: '[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|gif|svg|ico/i.test(ext)) {
              return `[name]-[hash].[ext]`;
            }
            if (ext === 'css') {
              return `[name]-[hash].[ext]`;
            }
            if (ext === 'js') {
              return `[name]-[hash].[ext]`;
            }
            return `[name]-[hash].[ext]`;
          },
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'antd-vendor': ['antd'],
            'utils-vendor': ['lodash', 'axios', 'dayjs', 'valtio']
          }
        }
      }
    },
    esbuild: {
      target: 'es2020'
    },
    server: {
      host: true,
      port: 5173,
      strictPort: false
    },
    define: {
      'BuildMode': JSON.stringify(mode || 'unknown')
    }
  }
})
