import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const request = axios.create({
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    
    // 登录请求不需要 token
    if (config.url.includes('/login')) {
      return config
    }
    
    if (!token) {
      ElMessage.error('请先登录')
      router.push('/login')
      return Promise.reject(new Error('No token'))
    }

    // 设置请求头，使用 Authorization 字段并添加 Bearer 前缀
    config.headers['Authorization'] = `Bearer ${token}`
    console.log('发送请求头:', config.headers) // 调试用
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401: // token 过期或无效
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          ElMessage.error('登录已过期，请重新登录')
          router.push('/login')
          break
        case 403: // 权限不足
          ElMessage.error('权限不足')
          router.push('/login')
          break
        default:
          ElMessage.error(error.response.data?.msg || '请求失败')
      }
    }
    return Promise.reject(error)
  }
)

export default request 