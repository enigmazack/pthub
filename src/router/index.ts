import { createRouter, RouteRecordRaw, createWebHashHistory } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/importSites',
    name: 'ImportSites',
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/ImportSites.vue'),
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/userData',
    name: 'UserData',
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/UserData.vue'),
    meta: {
      keepAlive: true
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
