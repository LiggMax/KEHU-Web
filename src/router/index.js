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
        requiresAuth: true,
        requiresAdmin: true
      }
    }
  ]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  // 如果路由需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    if (!localStorage.getItem('login_user')) {
      // 未登录，重定向到首页
      next({
        path: '/',
        query: { redirect: to.fullPath }
      })
    } else {
      // 检查是否需要管理员权限
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        const userInfo = JSON.parse(localStorage.getItem('login_user'));
        if (userInfo.role !== 'admin') {
          // 不是管理员，重定向到首页
          next({
            path: '/',
            query: { redirect: to.fullPath }
          })
        } else {
          // 是管理员，允许访问
          next()
        }
      } else {
        // 不需要管理员权限，允许访问
        next()
      }
    }
  } else {
    // 不需要认证的路由，直接导航
    next()
  }
})

export default router