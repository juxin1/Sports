import request from '@/utils/request'

// 获取所有订单
export const getAllOrders = (params) => {
  return request({
    url: '/orders/all',
    method: 'get',
    params: {
      page: params.page,
      size: params.size,
      username: params.username || '',
      name: params.name || '',
      status: params.status || ''
    }
  })
} 