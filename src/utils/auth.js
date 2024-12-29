import router from '@/router'
import { ElMessage } from 'element-plus'

export const logout = () => {
  // 清除 token
  localStorage.removeItem('token')
  // 清除用户信息
  localStorage.removeItem('user')
  // 清除其他可能的缓存数据
  sessionStorage.clear()
  // 重置一些全局状态（如果有的话）
  
  ElMessage.success('退出登录成功')
  router.push('/login')
} 