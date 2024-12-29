import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: '/admins',
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 直接返回响应数据，不做预处理
    return response
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)



// 管理员登录
export const adminLogin = (data) => {
  return request({
    url: '/login',
    method: 'post',
    data: {
      username: data.username,
      password: data.password
    }
  })
}

// 获取所有统计数量
export const getAllCounts = () => {
  return request({
    url: '/count',
    method: 'get'
  }).then(response => {
    return response.data
  })
} 