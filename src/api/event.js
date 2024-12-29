import request from '@/utils/request'

const baseURL = '/services'

// 获取所有运动项目
export const getAllEvents = (params) => {
  return request({
    url: baseURL,
    method: 'get',
    params: {
      page: params.page || 1,
      size: params.size || 10,
      name: params.name || '',
      status: params.status || ''
    }
  })
}

// 添加运动项目
export const addEvent = (data) => {
  return request({
    url: baseURL,
    method: 'post',
    data: {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      duration: Number(data.duration),
      status: data.status
    }
  })
}

// 更新运动项目
export const updateEvent = (sprotsId, data) => {
  return request({
    url: `${baseURL}/${sprotsId}`,
    method: 'put',
    data: {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      duration: Number(data.duration),
      status: data.status
    }
  })
}

// 删除运动项目（支持单个和批量删除）
export const deleteEvents = (ids) => {
  // 确保 ids 始终是数组
  const idList = Array.isArray(ids) ? ids : [ids]
  return request({
    url: baseURL,
    method: 'delete',
    params: {
      ids: idList // 直接传递数组，让 axios 处理参数序列化
    },
    paramsSerializer: {
      indexes: null // 数组参数序列化时不带索引
    }
  })
}


  