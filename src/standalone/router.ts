import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/importSites',
    name: 'ImportSites',
    // which is lazy-loaded when the route is visited.
    component: () => import('./views/ImportSites.vue'),
  },
  {
    path: '/userData',
    name: 'UserData',
    // which is lazy-loaded when the route is visited.
    component: () => import('./views/UserData.vue'),
  },
  {
    path: '/torrents',
    name: 'Torrents',
    component: () => import('./views/Torrents.vue'),
  },
  {
    path: '/siteSettings',
    name: 'SiteSettings',
    component: () => import('./views/SiteSettings.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
