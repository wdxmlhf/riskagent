// vite.config.js
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import tailwindcss from "file:///home/project/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///home/project/node_modules/autoprefixer/lib/autoprefixer.js";
import legacy from "file:///home/project/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";

// babel-plugins/vite-plugin-exit.ts
function ExitPlugin() {
  return {
    name: "vite-plugin-exit",
    // 插件名称
    // 构建结束钩子（无论成功与否都会调用）
    buildEnd(error) {
      if (error) {
        console.error("\u6784\u5EFA\u5931\u8D25:", error);
        process.exit(1);
      } else {
        console.log("\u6784\u5EFA\u9636\u6BB5\u7ED3\u675F\uFF0C\u53EF\u80FD\u4F1A\u7EE7\u7EED\u6267\u884C\u5176\u4ED6\u94A9\u5B50");
      }
    },
    // 当 Rollup 的 bundle 被写入后调用，通常标志构建最终完成
    closeBundle() {
      console.log("Bundle \u5DF2\u5173\u95ED\uFF0C\u6784\u5EFA\u5168\u90E8\u5B8C\u6210");
      setTimeout(() => {
        process.exit(0);
      }, 100);
    }
  };
}

// vite.config.js
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ command, mode }) => {
  const isProd = mode === "production";
  const cdnUrl = "//p2-ad.adkwai.com/bs2/ad-automate-cdn/project/177/";
  console.log("mode", mode, "command", command);
  const reactWithLoc = react({
    babel: {
      root: resolve(__vite_injected_original_dirname, "src"),
      presets: [
        ["@babel/preset-typescript", { isTSX: true, allExtensions: true }]
      ],
      // 确保保留位置信息
      retainLines: true,
      compact: false
    }
  });
  return {
    base: isProd ? cdnUrl : "/",
    plugins: [
      reactWithLoc,
      isProd ? ExitPlugin() : null,
      legacy({
        targets: ["ie >= 11"],
        additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
        polyfills: true,
        renderLegacyChunks: true,
        modernPolyfills: true
      })
    ],
    css: {
      modules: {
        localsConvention: "camelCase",
        generateScopedName: "[name]__[local]___[hash:base64:5]"
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
            overrideBrowserslist: ["> 1%", "last 2 versions"]
          })
        ]
      }
    },
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "src")
      }
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom", "antd", "axios", "valtio"],
      exclude: ["@vitejs/plugin-legacy"]
    },
    build: {
      outDir: "dist",
      assetsDir: "",
      target: "es2020",
      minify: "esbuild",
      cacheDir: "./.vite_cache",
      sourcemap: false,
      chunkSizeWarningLimit: 1e3,
      polyfillDynamicImport: false,
      rollupOptions: {
        input: resolve(__vite_injected_original_dirname, "index.html"),
        output: {
          //am的上传文件不支持目录。所以这里全部放在根目录下
          chunkFileNames: "[name]-[hash].js",
          entryFileNames: "[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split(".");
            const ext = info[info.length - 1];
            if (/png|jpe?g|gif|svg|ico/i.test(ext)) {
              return `[name]-[hash].[ext]`;
            }
            if (ext === "css") {
              return `[name]-[hash].[ext]`;
            }
            if (ext === "js") {
              return `[name]-[hash].[ext]`;
            }
            return `[name]-[hash].[ext]`;
          },
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "antd-vendor": ["antd"],
            "utils-vendor": ["lodash", "axios", "dayjs", "valtio"]
          }
        }
      }
    },
    esbuild: {
      target: "es2020"
    },
    server: {
      host: true,
      port: 5173,
      strictPort: false
    },
    define: {
      "BuildMode": JSON.stringify(mode || "unknown")
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAiYmFiZWwtcGx1Z2lucy92aXRlLXBsdWdpbi1leGl0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ3RhaWx3aW5kY3NzJ1xuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tICdhdXRvcHJlZml4ZXInXG5pbXBvcnQgbGVnYWN5IGZyb20gJ0B2aXRlanMvcGx1Z2luLWxlZ2FjeSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IEV4aXRQbHVnaW4gZnJvbSAnLi9iYWJlbC1wbHVnaW5zL3ZpdGUtcGx1Z2luLWV4aXQnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuICBjb25zdCBpc1Byb2QgPSBtb2RlID09PSAncHJvZHVjdGlvbidcbiAgY29uc3QgY2RuVXJsID0gJy8vcDItYWQuYWRrd2FpLmNvbS9iczIvYWQtYXV0b21hdGUtY2RuL3Byb2plY3QvMTc3LydcblxuICBjb25zb2xlLmxvZygnbW9kZScsIG1vZGUsICdjb21tYW5kJywgY29tbWFuZClcblxuICBjb25zdCByZWFjdFdpdGhMb2MgPSByZWFjdCh7XG4gICAgYmFiZWw6IHtcbiAgICAgIHJvb3Q6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXG4gICAgICBwcmVzZXRzOiBbXG4gICAgICAgIFsnQGJhYmVsL3ByZXNldC10eXBlc2NyaXB0JywgeyBpc1RTWDogdHJ1ZSwgYWxsRXh0ZW5zaW9uczogdHJ1ZSB9XVxuICAgICAgXSxcbiAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NEZERFx1NzU1OVx1NEY0RFx1N0Y2RVx1NEZFMVx1NjA2RlxuICAgICAgcmV0YWluTGluZXM6IHRydWUsXG4gICAgICBjb21wYWN0OiBmYWxzZVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4ge1xuICAgIGJhc2U6IGlzUHJvZCA/IGNkblVybCA6ICcvJyxcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdFdpdGhMb2MsXG4gICAgICBpc1Byb2QgPyAgRXhpdFBsdWdpbigpIDogbnVsbCxcbiAgICAgIGxlZ2FjeSh7XG4gICAgICAgIHRhcmdldHM6IFsnaWUgPj0gMTEnXSxcbiAgICAgICAgYWRkaXRpb25hbExlZ2FjeVBvbHlmaWxsczogWydyZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUnXSxcbiAgICAgICAgcG9seWZpbGxzOiB0cnVlLFxuICAgICAgICByZW5kZXJMZWdhY3lDaHVua3M6IHRydWUsXG4gICAgICAgIG1vZGVyblBvbHlmaWxsczogdHJ1ZVxuICAgICAgfSlcbiAgICBdLFxuICAgIGNzczoge1xuICAgICAgbW9kdWxlczoge1xuICAgICAgICBsb2NhbHNDb252ZW50aW9uOiAnY2FtZWxDYXNlJyxcbiAgICAgICAgZ2VuZXJhdGVTY29wZWROYW1lOiAnW25hbWVdX19bbG9jYWxdX19fW2hhc2g6YmFzZTY0OjVdJ1xuICAgICAgfSxcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgbGVzczoge1xuICAgICAgICAgIGphdmFzY3JpcHRFbmFibGVkOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICB0YWlsd2luZGNzcygpLFxuICAgICAgICAgIGF1dG9wcmVmaXhlcih7XG4gICAgICAgICAgICBvdmVycmlkZUJyb3dzZXJzbGlzdDogWyc+IDElJywgJ2xhc3QgMiB2ZXJzaW9ucyddXG4gICAgICAgICAgfSlcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpXG4gICAgICB9XG4gICAgfSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGluY2x1ZGU6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nLCAnYW50ZCcsICdheGlvcycsICd2YWx0aW8nXSxcbiAgICAgIGV4Y2x1ZGU6IFsnQHZpdGVqcy9wbHVnaW4tbGVnYWN5J11cbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6ICdkaXN0JyxcbiAgICAgIGFzc2V0c0RpcjogJycsXG4gICAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gICAgICBjYWNoZURpcjogJy4vLnZpdGVfY2FjaGUnLFxuICAgICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgICAgIHBvbHlmaWxsRHluYW1pY0ltcG9ydDogZmFsc2UsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGlucHV0OiByZXNvbHZlKF9fZGlybmFtZSwgJ2luZGV4Lmh0bWwnKSxcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgLy9hbVx1NzY4NFx1NEUwQVx1NEYyMFx1NjU4N1x1NEVGNlx1NEUwRFx1NjUyRlx1NjMwMVx1NzZFRVx1NUY1NVx1MzAwMlx1NjI0MFx1NEVFNVx1OEZEOVx1OTFDQ1x1NTE2OFx1OTBFOFx1NjUzRVx1NTcyOFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdbbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGFzc2V0SW5mby5uYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICBjb25zdCBleHQgPSBpbmZvW2luZm8ubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBpZiAoL3BuZ3xqcGU/Z3xnaWZ8c3ZnfGljby9pLnRlc3QoZXh0KSkge1xuICAgICAgICAgICAgICByZXR1cm4gYFtuYW1lXS1baGFzaF0uW2V4dF1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV4dCA9PT0gJ2NzcycpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBbbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChleHQgPT09ICdqcycpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBbbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBgW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgICAnYW50ZC12ZW5kb3InOiBbJ2FudGQnXSxcbiAgICAgICAgICAgICd1dGlscy12ZW5kb3InOiBbJ2xvZGFzaCcsICdheGlvcycsICdkYXlqcycsICd2YWx0aW8nXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgZXNidWlsZDoge1xuICAgICAgdGFyZ2V0OiAnZXMyMDIwJ1xuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiB0cnVlLFxuICAgICAgcG9ydDogNTE3MyxcbiAgICAgIHN0cmljdFBvcnQ6IGZhbHNlXG4gICAgfSxcbiAgICBkZWZpbmU6IHtcbiAgICAgICdCdWlsZE1vZGUnOiBKU09OLnN0cmluZ2lmeShtb2RlIHx8ICd1bmtub3duJylcbiAgICB9XG4gIH1cbn0pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3QvYmFiZWwtcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9iYWJlbC1wbHVnaW5zL3ZpdGUtcGx1Z2luLWV4aXQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9iYWJlbC1wbHVnaW5zL3ZpdGUtcGx1Z2luLWV4aXQudHNcIjtpbXBvcnQgdml0ZSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRXhpdFBsdWdpbigpIHtcbiAgIHJldHVybiB7XG4gICAgbmFtZTogJ3ZpdGUtcGx1Z2luLWV4aXQnLCAvLyBcdTYzRDJcdTRFRjZcdTU0MERcdTc5RjBcbiAgICAvLyBcdTY3ODRcdTVFRkFcdTdFRDNcdTY3NUZcdTk0QTlcdTVCNTBcdUZGMDhcdTY1RTBcdThCQkFcdTYyMTBcdTUyOUZcdTRFMEVcdTU0MjZcdTkwRkRcdTRGMUFcdThDMDNcdTc1MjhcdUZGMDlcbiAgICBidWlsZEVuZChlcnJvcikge1xuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Njc4NFx1NUVGQVx1NTkzMVx1OEQyNTonLCBlcnJvcik7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTsgLy8gXHU5NzVFXHU5NkY2XHU3MkI2XHU2MDAxXHU3ODAxXHU4ODY4XHU3OTNBXHU1OTMxXHU4RDI1XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnXHU2Nzg0XHU1RUZBXHU5NjM2XHU2QkI1XHU3RUQzXHU2NzVGXHVGRjBDXHU1M0VGXHU4MEZEXHU0RjFBXHU3RUU3XHU3RUVEXHU2MjY3XHU4ODRDXHU1MTc2XHU0RUQ2XHU5NEE5XHU1QjUwJyk7XG4gICAgICAgIC8vIFx1OTAxQVx1NUUzOFx1NEUwRFx1NTcyOFx1OEZEOVx1OTFDQ1x1OTAwMFx1NTFGQVx1RkYwQ1x1NTZFMFx1NEUzQSBjbG9zZUJ1bmRsZSBcdTUzRUZcdTgwRkRcdThGRDhcdTY3MkFcdThDMDNcdTc1MjhcbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIFx1NUY1MyBSb2xsdXAgXHU3Njg0IGJ1bmRsZSBcdTg4QUJcdTUxOTlcdTUxNjVcdTU0MEVcdThDMDNcdTc1MjhcdUZGMENcdTkwMUFcdTVFMzhcdTY4MDdcdTVGRDdcdTY3ODRcdTVFRkFcdTY3MDBcdTdFQzhcdTVCOENcdTYyMTBcbiAgICBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdCdW5kbGUgXHU1REYyXHU1MTczXHU5NUVEXHVGRjBDXHU2Nzg0XHU1RUZBXHU1MTY4XHU5MEU4XHU1QjhDXHU2MjEwJyk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDApOyAvLyBcdTYyMTBcdTUyOUZcdTkwMDBcdTUxRkFcbiAgICAgIH0sIDEwMCk7IC8vIFx1NkRGQlx1NTJBMFx1NEUwMFx1NEUyQVx1NzdFRFx1NjY4Mlx1NzY4NFx1NUVGNlx1OEZERlx1RkYwQ1x1Nzg2RVx1NEZERFx1NTE3Nlx1NEVENlx1NTQwRVx1N0VFRFx1NjRDRFx1NEY1Q1x1NUI4Q1x1NjIxMFxuICAgIH0sXG4gIH07XG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxTQUFTLGVBQWU7QUFDeEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxrQkFBa0I7QUFDekIsT0FBTyxZQUFZO0FBQ25C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
