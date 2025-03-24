import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import UserCenter from '../views/UserCenter.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue')
    },
    {
      path: '/services',
      name: 'services',
      component: () => import('../views/Services.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/Contact.vue')
    },
    {
      path: '/user-center',
      name: 'user-center',
      component: UserCenter,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/video/:id',
      name: 'VideoDetail',
      component: () => import('../views/VideoDetail.vue')
    },
    {
      path: '/search',
      name: 'SearchResults',
      component: () => import('../views/SearchResults.vue')
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('@/views/admin/AdminLogin.vue')
    },
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/AdminDashboard.vue')
        },
        {
          path: 'users',
          name: 'UserManagement',
          component: () => import('@/views/admin/UserManagement.vue')
        },
        {
          path: 'videos',
          name: 'VideoManagement',
          component: () => import('@/views/admin/VideoManagement.vue')
        },
        {
          path: 'comments',
          name: 'CommentManagement',
          component: () => import('@/views/admin/CommentManagement.vue')
        },
        {
          path: 'settings',
          name: 'SystemSettings',
          component: () => import('@/views/admin/SystemSettings.vue')
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userInfo = localStorage.getItem('login_user')
  
  if (to.path.startsWith('/admin') && to.path !== '/admin/login' && !userInfo) {
    next('/admin/login')
  } else {
    next()
  }
})

export default router