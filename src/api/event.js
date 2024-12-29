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