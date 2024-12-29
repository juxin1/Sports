import request from '@/utils/request'

// 获取所有活动
export const getAllEvents = (params) => {
  return request({
    url: '/services',
    method: 'get',
    params: {
      page: params.page,
      size: params.size,
      name: params.name || '',
      status: params.status ? params.status.toString() : ''
    }
  })
}

// 添加更新活动方法
export const updateEvent = (sprotsId, data) => {
  return request({
    url: `/services/${sprotsId}`,
    method: 'put',
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      status: data.status.toString()  // 确保状态为字符串
    }
  })
}

// 修改删除方法
export const deleteEvents = (ids) => {
  // 将数组转换为逗号分隔的字符串
  const idsString = Array.isArray(ids) ? ids.join(',') : ids;
  
  return request({
    url: '/services',
    method: 'delete',
    params: {
      ids: idsString  // 传递逗号分隔的字符串
    },
    paramsSerializer: {
      indexes: null // 确保数组参数正确序列化
    }
  })
}

// 添加创建活动方法
export const createEvent = (data) => {
  return request({
    url: '/services',
    method: 'post',
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      status: data.status.toString()  // 确保状态为字符串
    }
  })
} 