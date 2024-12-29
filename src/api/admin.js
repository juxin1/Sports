import request from '@/utils/request'

const baseURL = '/admins'

// 管理员登录
export const adminLogin = (data) => {
  return request({
    url: `${baseURL}/login`,
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
    url: `${baseURL}/count`,
    method: 'get'
  }).then(response => {
    // 确保返回正确的数据结构
    return response.data
  })
} 