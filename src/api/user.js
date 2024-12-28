import axios from 'axios'

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