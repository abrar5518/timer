import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import App from './App.vue'
import './assets/style/main.css'

import LandingPage from './views/LandingPage.vue'
import AdminView from './views/AdminView.vue'
import HostView from './views/HostView.vue'
import AudienceView from './views/AudienceView.vue'
import NotFound from './views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LandingPage },
    { path: '/login', component: () => import('./views/LoginView.vue') },
    { path: '/register', component: () => import('./views/RegisterView.vue') },
    { path: '/dashboard', component: () => import('./views/DashboardView.vue'), meta: { requiresAuth: true } },
    { path: '/profile', component: () => import('./views/ProfileView.vue'), meta: { requiresAuth: true } },
    { path: '/admin', component: AdminView, meta: { requiresAuth: true } },
    { path: '/host/:code', component: HostView, meta: { requiresAuth: true } },
    { path: '/audience/:code', component: AudienceView },
    { path: '/overlay/:code', component: () => import('./views/BroadcastOverlay.vue') },
    { path: '/report/:code', component: () => import('./views/ReportView.vue') },
    { path: '/contact', component: () => import('./views/ContactView.vue') },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

const app = createApp(App)
app.use(router)
app.use(autoAnimatePlugin)
app.mount('#app')
