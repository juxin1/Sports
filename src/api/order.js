import request from '@/utils/request'

const baseURL = '/orders'

// 获取所有订单
export const getAllOrders = (params) => {
  return request({
    url: `${baseURL}/all`,
    method: 'get',
    params
  })
}

// 删除订单
export const deleteOrders = (ids) => {
  const idsString = Array.isArray(ids) ? ids.join(',') : ids
  return request({
    url: `${baseURL}`,
    method: 'delete',
    params: {
      ids: idsString
    }
  })
}

// 更新订单
export const updateOrder = (orderId, data) => {
  return request({
    url: `${baseURL}/${orderId}`,
    method: 'put',
    data
  })
} 