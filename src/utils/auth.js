import router from '@/router'
import { ElMessage } from 'element-plus'

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.clear()
  
  ElMessage.success('退出登录成功')
  router.push('/login')
}

export const checkAuth = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.error('请先登录')
    router.push('/login')
    return false
  }
  return true
} 