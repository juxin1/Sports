import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue')
  },
  {
    path: '/admin',
    component: () => import('../components/layout/AdminLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../pages/admin/Dashboard.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../pages/admin/Users.vue'),
        meta: { requiresAuth: true, role: 'admin', title: '用户管理' }
      },
      {
        path: 'events',
        name: 'AdminEvents',
        component: () => import('../pages/admin/Events.vue'),
        meta: { requiresAuth: true, role: 'admin', title: '活动管理' }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../pages/admin/Orders.vue'),
        meta: { requiresAuth: true, role: 'admin', title: '订单管理' }
      }
    ]
  },
  {
    path: '/user',
    component: () => import('../components/layout/UserLayout.vue'),
    children: [
      {
        path: 'home',
        name: 'UserHome',
        component: () => import('../pages/user/Home.vue'),
        meta: { requiresAuth: true, role: 'user' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 修改路由守卫
router.beforeEach((to, from, next) => {
  // 登录页面直接放行
  if (to.path === '/login') {
    next()
    return
  }

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // 需要验证的页面
  if (to.meta.requiresAuth) {
    if (!token) {
      ElMessage.error('请先登录')
      next('/login')
      return
    }

    // 验证管理员权限
    if (to.meta.role === 'admin' && user.role !== 'admin') {
      ElMessage.error('无权访问管理页面')
      next('/login')
      return
    }
  }

  next()
})

export default router 