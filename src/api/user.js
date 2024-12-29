import request from '@/utils/request'

const baseURL = '/users'

// 用户登录
export const login = (data) => {
  return request({
    url: `${baseURL}/login`,
    method: 'post',
    data: {
      username: data.username,
      password: data.password
    }
  })
}

// 获取所有用户
export const getAllUsers = (params) => {
  return request({
    url: `${baseURL}/all`,
    method: 'get',
    params: {
      page: params.page || 1,
      size: params.size || 10,
      name: params.name || '',
      status: String(params.status || '1'),
      role: String(params.role || '0')
    }
  })
}

// 删除用户（支持单个和批量删除）
export const deleteUsers = (ids) => {
  // 确保 ids 是数组并转换为字符串
  const idList = Array.isArray(ids) ? ids : [ids]
  
  return request({
    url: `${baseURL}`,
    method: 'delete',
    params: {
      // 将数组转换为逗号分隔的字符串
      ids: idList.join(',')
    }
  })
}

// 更新用户
export const updateUser = (userId, userData) => {
  return request({
    url: `${baseURL}/${userId}`,
    method: 'put',
    data: userData
  })
}

// 用户注册
export const register = (userData) => {
  return request({
    url: `${baseURL}/register`,
    method: 'post',
    data: {
      username: userData.username,
      password: userData.password,
      email: userData.email,
      phone: userData.phone || '',
      full_name: userData.full_name,
      role: userData.role,
      status: userData.status
    }
  })
}

