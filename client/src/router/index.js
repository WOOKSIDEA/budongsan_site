import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PropertyDetail from '../views/PropertyDetail.vue'
import AdminView from '../views/AdminView.vue'
import AdminLogin from '../views/AdminLogin.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/property/:id', component: PropertyDetail },
    { path: '/admin/login', component: AdminLogin },
    {
      path: '/admin',
      component: AdminView,
      beforeEnter: () => {
        const auth = useAuthStore()
        if (!auth.token) return '/admin/login'
      }
    }
  ]
})

export default router
