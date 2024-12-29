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

// 添加删除方法（支持单个和批量删除）
export const deleteOrders = (ids) => {
  // 将数组转换为逗号分隔的字符串
  const idsString = Array.isArray(ids) ? ids.join(',') : ids;
  
  return request({
    url: '/orders',
    method: 'delete',
    params: {
      ids: idsString
    }
  })
}

// 添加更新订单方法
export const updateOrder = (orderId, data) => {
  return request({
    url: `/orders/${orderId}`,
    method: 'put',
    data: {
      total_price: data.total_price,
      status: data.status
    }
  })
} 