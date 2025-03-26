import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import UserCenter from '../views/UserCenter.vue'

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
      component: () => import('../views/admin/AdminLogin.vue')
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('../views/admin/AdminDashboard.vue'),
      meta: {
        requiresAdminAuth: true
      }
    }
  ]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  // 如果路由需要管理员认证
  if (to.matched.some(record => record.meta.requiresAdminAuth)) {
    // 检查是否已登录为管理员
    if (!localStorage.getItem('admin_token')) {
      // 未登录，重定向到管理员登录页
      next({
        path: '/admin/login',
        query: { redirect: to.fullPath }
      })
    } else {
      // 已登录，继续导航
      next()
    }
  }
  // 如果路由需要普通用户认证
  else if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    if (!localStorage.getItem('login_user')) {
      // 未登录，重定向到首页
      next({
        path: '/',
        query: { redirect: to.fullPath }
      })
    } else {
      // 已登录，继续导航
      next()
    }
  } else {
    // 不需要认证的路由，直接导航
    next()
  }
})

export default router