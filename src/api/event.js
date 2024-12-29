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
export const updateEvent = (eventId, data) => {
  return request({
    url: `${baseURL}/${eventId}`,
    method: 'put',
    data
  })
}

// 删除运动项目
export const deleteEvents = (ids) => {
  const idList = Array.isArray(ids) ? ids : [ids]
  return request({
    url: baseURL,
    method: 'delete',
    params: {
      ids: idList.join(',')
    }
  })
}


  