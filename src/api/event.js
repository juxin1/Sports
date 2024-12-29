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

// 更新运动项目
export const updateEvent = (eventId, data) => {
  return request({
    url: `${baseURL}/${eventId}`,
    method: 'put',
    data
  })
}

// 删除运动项目
export const deleteEvents = (ids) => {
  // 确保 ids 是数组并转换为字符串
  const idList = Array.isArray(ids) ? ids : [ids]
  return request({
    url: baseURL,
    method: 'delete',
    params: {
      ids: idList.join(',')
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


  