import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { port, isDev, r } from './scripts/utils'

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
      emptyOutDir: false,
      sourcemap: isDev ? 'inline' : false,
      // https://developer.chrome.com/docs/webstore/program_policies/#:~:text=Code%20Readability%20Requirements
      terserOptions: {
        mangle: false
      },
      rollupOptions: {
        input: {
          background: r('src/background/index.html'),
          view: r('src/view/index.html')
        }
      }

    },
    plugins: [
      vue(),
      // rewrite assets to use relative path
      {
        name: 'assets-rewrite',
        enforce: 'post',
        apply: 'build',
        transformIndexHtml (html) {
          return html.replace(/"\/assets\//g, '"../assets/')
        }
      }
    ],
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: true
    },
    optimizeDeps: {
      include: [
        'vue'
      ]
    }
  }
})
