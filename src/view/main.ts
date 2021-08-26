import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/lib/components'
import * as directives from 'vuetify/lib/directives'
import App from './App.vue'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/lib/styles/main.sass'

const vuetify = createVuetify({
  components,
  directives
})

createApp(App)
  .use(vuetify)
  .mount('#app')
