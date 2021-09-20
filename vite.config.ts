import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { port, isDev, r } from './scripts/utils'
import aliyunTheme from '@ant-design/aliyun-theme'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    root: r('src'),
    base: command === 'serve' ? `http://localhost:${port}/` : undefined,
    resolve: {
      alias: {
        '@/': `${r('src')}/`
      }
    },
    server: {
      port,
      hmr: {
        host: 'localhost'
      }
    },
    build: {
      outDir: r('extension/dist'),
      assetsDir: 'assets',
      emptyOutDir: false,
      sourcemap: isDev ? 'inline' : false,
      // https://developer.chrome.com/docs/webstore/program_policies/#:~:text=Code%20Readability%20Requirements
      terserOptions: {
        mangle: false
      },
      rollupOptions: {
        input: {
          background: r('src/background/index.html'),
          main: r('src/index.html')
        }
      }

    },
    plugins: [
      vue()
    ],
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: true
    },
    optimizeDeps: {
      include: [
        'vue'
      ]
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            ...aliyunTheme
            // '@font-size-sm': '14px',
            // '@font-size-base': '14px'
          },
          javascriptEnabled: true
        }
      }
    }
  }
})
