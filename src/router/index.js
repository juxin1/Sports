import { createRouter, createWebHistory } from 'vue-router'

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

// 路由守卫
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'))
  
  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if (to.meta.role && user?.role !== to.meta.role) {
    next('/login')
  } else {
    next()
  }
})

export default router 