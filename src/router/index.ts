import { createRouter, RouteRecordRaw, createWebHashHistory } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/importSites',
    name: 'ImportSites',
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/ImportSites.vue')
  },
  {
    path: '/userData',
    name: 'UserData',
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/UserData.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
