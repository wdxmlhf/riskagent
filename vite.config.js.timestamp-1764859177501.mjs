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
    base: "./",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAiYmFiZWwtcGx1Z2lucy92aXRlLXBsdWdpbi1leGl0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ3RhaWx3aW5kY3NzJ1xuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tICdhdXRvcHJlZml4ZXInXG5pbXBvcnQgbGVnYWN5IGZyb20gJ0B2aXRlanMvcGx1Z2luLWxlZ2FjeSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IEV4aXRQbHVnaW4gZnJvbSAnLi9iYWJlbC1wbHVnaW5zL3ZpdGUtcGx1Z2luLWV4aXQnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuICBjb25zdCBpc1Byb2QgPSBtb2RlID09PSAncHJvZHVjdGlvbidcblxuICBjb25zb2xlLmxvZygnbW9kZScsIG1vZGUsICdjb21tYW5kJywgY29tbWFuZClcblxuICBjb25zdCByZWFjdFdpdGhMb2MgPSByZWFjdCh7XG4gICAgYmFiZWw6IHtcbiAgICAgIHJvb3Q6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXG4gICAgICBwcmVzZXRzOiBbXG4gICAgICAgIFsnQGJhYmVsL3ByZXNldC10eXBlc2NyaXB0JywgeyBpc1RTWDogdHJ1ZSwgYWxsRXh0ZW5zaW9uczogdHJ1ZSB9XVxuICAgICAgXSxcbiAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NEZERFx1NzU1OVx1NEY0RFx1N0Y2RVx1NEZFMVx1NjA2RlxuICAgICAgcmV0YWluTGluZXM6IHRydWUsXG4gICAgICBjb21wYWN0OiBmYWxzZVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4ge1xuICAgIGJhc2U6ICcuLycsXG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3RXaXRoTG9jLFxuICAgICAgaXNQcm9kID8gIEV4aXRQbHVnaW4oKSA6IG51bGwsXG4gICAgICBsZWdhY3koe1xuICAgICAgICB0YXJnZXRzOiBbJ2llID49IDExJ10sXG4gICAgICAgIGFkZGl0aW9uYWxMZWdhY3lQb2x5ZmlsbHM6IFsncmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lJ10sXG4gICAgICAgIHBvbHlmaWxsczogdHJ1ZSxcbiAgICAgICAgcmVuZGVyTGVnYWN5Q2h1bmtzOiB0cnVlLFxuICAgICAgICBtb2Rlcm5Qb2x5ZmlsbHM6IHRydWVcbiAgICAgIH0pXG4gICAgXSxcbiAgICBjc3M6IHtcbiAgICAgIG1vZHVsZXM6IHtcbiAgICAgICAgbG9jYWxzQ29udmVudGlvbjogJ2NhbWVsQ2FzZScsXG4gICAgICAgIGdlbmVyYXRlU2NvcGVkTmFtZTogJ1tuYW1lXV9fW2xvY2FsXV9fX1toYXNoOmJhc2U2NDo1XSdcbiAgICAgIH0sXG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgIGxlc3M6IHtcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcG9zdGNzczoge1xuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgdGFpbHdpbmRjc3MoKSxcbiAgICAgICAgICBhdXRvcHJlZml4ZXIoe1xuICAgICAgICAgICAgb3ZlcnJpZGVCcm93c2Vyc2xpc3Q6IFsnPiAxJScsICdsYXN0IDIgdmVyc2lvbnMnXVxuICAgICAgICAgIH0pXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKVxuICAgICAgfVxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJywgJ2FudGQnLCAnYXhpb3MnLCAndmFsdGlvJ10sXG4gICAgICBleGNsdWRlOiBbJ0B2aXRlanMvcGx1Z2luLWxlZ2FjeSddXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgICBhc3NldHNEaXI6ICcnLFxuICAgICAgdGFyZ2V0OiAnZXMyMDIwJyxcbiAgICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxuICAgICAgY2FjaGVEaXI6ICcuLy52aXRlX2NhY2hlJyxcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgICBwb2x5ZmlsbER5bmFtaWNJbXBvcnQ6IGZhbHNlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBpbnB1dDogcmVzb2x2ZShfX2Rpcm5hbWUsICdpbmRleC5odG1sJyksXG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIC8vYW1cdTc2ODRcdTRFMEFcdTRGMjBcdTY1ODdcdTRFRjZcdTRFMERcdTY1MkZcdTYzMDFcdTc2RUVcdTVGNTVcdTMwMDJcdTYyNDBcdTRFRTVcdThGRDlcdTkxQ0NcdTUxNjhcdTkwRThcdTY1M0VcdTU3MjhcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBhc3NldEluZm8ubmFtZS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgY29uc3QgZXh0ID0gaW5mb1tpbmZvLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgaWYgKC9wbmd8anBlP2d8Z2lmfHN2Z3xpY28vaS50ZXN0KGV4dCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBbbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChleHQgPT09ICdjc3MnKSB7XG4gICAgICAgICAgICAgIHJldHVybiBgW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXh0ID09PSAnanMnKSB7XG4gICAgICAgICAgICAgIHJldHVybiBgW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYFtuYW1lXS1baGFzaF0uW2V4dF1gO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgICAgJ2FudGQtdmVuZG9yJzogWydhbnRkJ10sXG4gICAgICAgICAgICAndXRpbHMtdmVuZG9yJzogWydsb2Rhc2gnLCAnYXhpb3MnLCAnZGF5anMnLCAndmFsdGlvJ11cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGVzYnVpbGQ6IHtcbiAgICAgIHRhcmdldDogJ2VzMjAyMCdcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIHBvcnQ6IDUxNzMsXG4gICAgICBzdHJpY3RQb3J0OiBmYWxzZVxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICAnQnVpbGRNb2RlJzogSlNPTi5zdHJpbmdpZnkobW9kZSB8fCAndW5rbm93bicpXG4gICAgfVxuICB9XG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L2JhYmVsLXBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3QvYmFiZWwtcGx1Z2lucy92aXRlLXBsdWdpbi1leGl0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3QvYmFiZWwtcGx1Z2lucy92aXRlLXBsdWdpbi1leGl0LnRzXCI7aW1wb3J0IHZpdGUgZnJvbSAndml0ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEV4aXRQbHVnaW4oKSB7XG4gICByZXR1cm4ge1xuICAgIG5hbWU6ICd2aXRlLXBsdWdpbi1leGl0JywgLy8gXHU2M0QyXHU0RUY2XHU1NDBEXHU3OUYwXG4gICAgLy8gXHU2Nzg0XHU1RUZBXHU3RUQzXHU2NzVGXHU5NEE5XHU1QjUwXHVGRjA4XHU2NUUwXHU4QkJBXHU2MjEwXHU1MjlGXHU0RTBFXHU1NDI2XHU5MEZEXHU0RjFBXHU4QzAzXHU3NTI4XHVGRjA5XG4gICAgYnVpbGRFbmQoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdcdTY3ODRcdTVFRkFcdTU5MzFcdThEMjU6JywgZXJyb3IpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7IC8vIFx1OTc1RVx1OTZGNlx1NzJCNlx1NjAwMVx1NzgwMVx1ODg2OFx1NzkzQVx1NTkzMVx1OEQyNVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1x1Njc4NFx1NUVGQVx1OTYzNlx1NkJCNVx1N0VEM1x1Njc1Rlx1RkYwQ1x1NTNFRlx1ODBGRFx1NEYxQVx1N0VFN1x1N0VFRFx1NjI2N1x1ODg0Q1x1NTE3Nlx1NEVENlx1OTRBOVx1NUI1MCcpO1xuICAgICAgICAvLyBcdTkwMUFcdTVFMzhcdTRFMERcdTU3MjhcdThGRDlcdTkxQ0NcdTkwMDBcdTUxRkFcdUZGMENcdTU2RTBcdTRFM0EgY2xvc2VCdW5kbGUgXHU1M0VGXHU4MEZEXHU4RkQ4XHU2NzJBXHU4QzAzXHU3NTI4XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBcdTVGNTMgUm9sbHVwIFx1NzY4NCBidW5kbGUgXHU4OEFCXHU1MTk5XHU1MTY1XHU1NDBFXHU4QzAzXHU3NTI4XHVGRjBDXHU5MDFBXHU1RTM4XHU2ODA3XHU1RkQ3XHU2Nzg0XHU1RUZBXHU2NzAwXHU3RUM4XHU1QjhDXHU2MjEwXG4gICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICBjb25zb2xlLmxvZygnQnVuZGxlIFx1NURGMlx1NTE3M1x1OTVFRFx1RkYwQ1x1Njc4NFx1NUVGQVx1NTE2OFx1OTBFOFx1NUI4Q1x1NjIxMCcpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgwKTsgLy8gXHU2MjEwXHU1MjlGXHU5MDAwXHU1MUZBXG4gICAgICB9LCAxMDApOyAvLyBcdTZERkJcdTUyQTBcdTRFMDBcdTRFMkFcdTc3RURcdTY2ODJcdTc2ODRcdTVFRjZcdThGREZcdUZGMENcdTc4NkVcdTRGRERcdTUxNzZcdTRFRDZcdTU0MEVcdTdFRURcdTY0Q0RcdTRGNUNcdTVCOENcdTYyMTBcbiAgICB9LFxuICB9O1xufSJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsU0FBUyxlQUFlO0FBQ3hCLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sa0JBQWtCO0FBQ3pCLE9BQU8sWUFBWTtBQUNuQixPQUFPLFdBQVc7OztBQ0hILFNBQVIsYUFBOEI7QUFDbEMsU0FBTztBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUE7QUFBQSxJQUVOLFNBQVMsT0FBTztBQUNkLFVBQUksT0FBTztBQUNULGdCQUFRLE1BQU0sNkJBQVMsS0FBSztBQUM1QixnQkFBUSxLQUFLLENBQUM7QUFBQSxNQUNoQixPQUFPO0FBQ0wsZ0JBQVEsSUFBSSw4R0FBb0I7QUFBQSxNQUVsQztBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsY0FBYztBQUNaLGNBQVEsSUFBSSxxRUFBbUI7QUFDL0IsaUJBQVcsTUFBTTtBQUNmLGdCQUFRLEtBQUssQ0FBQztBQUFBLE1BQ2hCLEdBQUcsR0FBRztBQUFBLElBQ1I7QUFBQSxFQUNGO0FBQ0Y7OztBRHZCQSxJQUFNLG1DQUFtQztBQVN6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFNBQVMsS0FBSyxNQUFNO0FBQ2pELFFBQU0sU0FBUyxTQUFTO0FBRXhCLFVBQVEsSUFBSSxRQUFRLE1BQU0sV0FBVyxPQUFPO0FBRTVDLFFBQU0sZUFBZSxNQUFNO0FBQUEsSUFDekIsT0FBTztBQUFBLE1BQ0wsTUFBTSxRQUFRLGtDQUFXLEtBQUs7QUFBQSxNQUM5QixTQUFTO0FBQUEsUUFDUCxDQUFDLDRCQUE0QixFQUFFLE9BQU8sTUFBTSxlQUFlLEtBQUssQ0FBQztBQUFBLE1BQ25FO0FBQUE7QUFBQSxNQUVBLGFBQWE7QUFBQSxNQUNiLFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRixDQUFDO0FBRUQsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBLFNBQVUsV0FBVyxJQUFJO0FBQUEsTUFDekIsT0FBTztBQUFBLFFBQ0wsU0FBUyxDQUFDLFVBQVU7QUFBQSxRQUNwQiwyQkFBMkIsQ0FBQyw2QkFBNkI7QUFBQSxRQUN6RCxXQUFXO0FBQUEsUUFDWCxvQkFBb0I7QUFBQSxRQUNwQixpQkFBaUI7QUFBQSxNQUNuQixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ1Asa0JBQWtCO0FBQUEsUUFDbEIsb0JBQW9CO0FBQUEsTUFDdEI7QUFBQSxNQUNBLHFCQUFxQjtBQUFBLFFBQ25CLE1BQU07QUFBQSxVQUNKLG1CQUFtQjtBQUFBLFFBQ3JCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1AsU0FBUztBQUFBLFVBQ1AsWUFBWTtBQUFBLFVBQ1osYUFBYTtBQUFBLFlBQ1gsc0JBQXNCLENBQUMsUUFBUSxpQkFBaUI7QUFBQSxVQUNsRCxDQUFDO0FBQUEsUUFDSDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLE1BQy9CO0FBQUEsSUFDRjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLFNBQVMsYUFBYSxvQkFBb0IsUUFBUSxTQUFTLFFBQVE7QUFBQSxNQUM3RSxTQUFTLENBQUMsdUJBQXVCO0FBQUEsSUFDbkM7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLFVBQVU7QUFBQSxNQUNWLFdBQVc7QUFBQSxNQUNYLHVCQUF1QjtBQUFBLE1BQ3ZCLHVCQUF1QjtBQUFBLE1BQ3ZCLGVBQWU7QUFBQSxRQUNiLE9BQU8sUUFBUSxrQ0FBVyxZQUFZO0FBQUEsUUFDdEMsUUFBUTtBQUFBO0FBQUEsVUFFTixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0IsQ0FBQyxjQUFjO0FBQzdCLGtCQUFNLE9BQU8sVUFBVSxLQUFLLE1BQU0sR0FBRztBQUNyQyxrQkFBTSxNQUFNLEtBQUssS0FBSyxTQUFTLENBQUM7QUFDaEMsZ0JBQUkseUJBQXlCLEtBQUssR0FBRyxHQUFHO0FBQ3RDLHFCQUFPO0FBQUEsWUFDVDtBQUNBLGdCQUFJLFFBQVEsT0FBTztBQUNqQixxQkFBTztBQUFBLFlBQ1Q7QUFDQSxnQkFBSSxRQUFRLE1BQU07QUFDaEIscUJBQU87QUFBQSxZQUNUO0FBQ0EsbUJBQU87QUFBQSxVQUNUO0FBQUEsVUFDQSxjQUFjO0FBQUEsWUFDWixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsWUFDekQsZUFBZSxDQUFDLE1BQU07QUFBQSxZQUN0QixnQkFBZ0IsQ0FBQyxVQUFVLFNBQVMsU0FBUyxRQUFRO0FBQUEsVUFDdkQ7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLFFBQVE7QUFBQSxJQUNWO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsSUFDZDtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sYUFBYSxLQUFLLFVBQVUsUUFBUSxTQUFTO0FBQUEsSUFDL0M7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
