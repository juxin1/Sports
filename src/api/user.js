import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const request = axios.create({
  baseURL: '/users',
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
    if (token) {
      config.headers['token'] = token
    }
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
          router.push('/login')
          break
        case 403: // 权限不足
          ElMessage.error('权限不足')
          break
      }
    }
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 获取所有用户
export const getAllUsers = (params) => {
  return request({
    url: '/all',
    method: 'get',
    params: {
      page: params.page,
      size: params.size,
      name: params.name,
      status: params.status
    }
  }).then(response => {
    return response.data
  })
}

// 用户登录
export const login = (data) => {
  return request({
    url: '/login',
    method: 'post',
    data: {
      username: data.username,
      password: data.password
    }
  })
}

// 修改删除用户方法
export const deleteUsers = (ids) => {
  // 直接将数组转换为逗号分隔的字符串
  const idsString = Array.isArray(ids) ? ids.join(',') : ids;
  
  return request({
    url: '',  // 使用空字符串，因为我们要访问根路径
    method: 'delete',
    params: {
      ids: idsString  // 直接传递逗号分隔的字符串
    }
  }).then(response => {
    return response.data
  })
}

// 添加更新用户方法
export const updateUser = (userId, userData) => {
  return request({
    url: `/${userId}`,
    method: 'put',
    data: userData
  }).then(response => {
    return response.data
  })
}

// 添加用户注册方法
export const register = (userData) => {
  return request({
    url: '/register',
    method: 'post',
    data: userData
  }).then(response => {
    return response.data
  })
}

