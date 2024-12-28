<template>
  <div class="login-page">
    <div class="login-container" :class="{ 'dark-mode': isDarkMode }">
      <template v-if="!isLogin">
        <el-button
          class="back-button"
          @click="isLogin = true"
          :icon="ArrowLeft"
          circle
        />
      </template>

      <div class="theme-toggle" @click="toggleTheme">
        <el-icon :size="24">
          <component :is="isDarkMode ? 'Sunny' : 'Moon'" />
        </el-icon>
      </div>
      
      <div class="login-content">
        <div class="login-header">
          <div class="logo-container">
            <el-icon :size="48" color="var(--primary-color)"><Platform /></el-icon>
          </div>
          <h1>科创园体育服务</h1>
          <p>{{ isLogin ? '欢迎回来，请登录您的账号' : '创建一个新账号' }}</p>
        </div>

        <template v-if="isLogin">
          <form class="login-form" @submit.prevent="handleLogin">
            <div class="user-type-tabs">
              <div 
                class="tab-item" 
                :class="{ active: loginForm.userType === 'user' }"
                @click="loginForm.userType = 'user'"
              >
                <el-icon><User /></el-icon>
                <span>普通用户</span>
              </div>
              <div 
                class="tab-item"
                :class="{ active: loginForm.userType === 'admin' }"
                @click="loginForm.userType = 'admin'"
              >
                <el-icon><UserFilled /></el-icon>
                <span>管理员</span>
              </div>
            </div>

            <div class="form-group">
              <el-input
                v-model="loginForm.username"
                :placeholder="loginForm.userType === 'admin' ? '管理员账号' : '用户名'"
                :prefix-icon="User"
                size="large"
              />
            </div>

            <div class="form-group">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                size="large"
                show-password
              />
            </div>

            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
              <el-button link type="primary">忘记密码？</el-button>
            </div>

            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="submit-btn"
              @click="handleLogin"
            >
              登录
            </el-button>

            <div class="form-footer">
              <span>还没有账号？</span>
              <el-button link type="primary" @click="toggleForm">立即注册</el-button>
            </div>
          </form>
        </template>
        <template v-else>
          <form class="register-form" @submit.prevent="handleRegister">
            <div class="form-group">
              <el-input
                v-model="registerForm.username"
                placeholder="用户名"
                :prefix-icon="User"
                size="large"
                maxlength="20"
              >
                <template #append>
                  <el-tooltip content="用户名长度在3-20个字符之间，只能包含字母、数字和下划线" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input>
            </div>

            <div class="form-group">
              <el-input
                v-model="registerForm.full_name"
                placeholder="真实姓名"
                :prefix-icon="UserFilled"
                size="large"
                maxlength="50"
              />
            </div>

            <div class="form-group">
              <el-input
                v-model="registerForm.email"
                type="email"
                placeholder="电子邮箱"
                :prefix-icon="Message"
                size="large"
                maxlength="100"
              />
            </div>

            <div class="form-group">
              <el-input
                v-model="registerForm.phone"
                placeholder="手机号码"
                :prefix-icon="Phone"
                size="large"
                maxlength="15"
              >
                <template #prepend>+86</template>
              </el-input>
            </div>

            <div class="form-group">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                size="large"
                show-password
              >
                <template #append>
                  <el-tooltip content="密码长度至少8位，必须包含字母和数字" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input>
            </div>

            <div class="form-group">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="确认密码"
                :prefix-icon="Lock"
                size="large"
                show-password
              />
            </div>

            <div class="form-agreement">
              <el-checkbox v-model="registerForm.agreement">
                我已阅读并同意
                <el-button link type="primary">服务条款</el-button>
                和
                <el-button link type="primary">隐私政策</el-button>
              </el-checkbox>
            </div>

            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="submit-btn"
              @click="handleRegister"
            >
              注册
            </el-button>

            <div class="form-footer">
              <span>已有账号？</span>
              <el-button link type="primary" @click="toggleForm">立即登录</el-button>
            </div>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, 
  UserFilled, 
  Lock, 
  Message, 
  Phone,
  QuestionFilled,
  ArrowLeft
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { login, register } from '@/api/user'
import { adminLogin } from '../api/admin'

const router = useRouter()
const loading = ref(false)
const isDarkMode = ref(false)
const isLogin = ref(true)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false,
  userType: 'user'
})

const registerForm = reactive({
  username: '',
  full_name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
}

const toggleForm = () => {
  isLogin.value = !isLogin.value
}

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const loginApi = loginForm.userType === 'admin' ? adminLogin : login
    const loginData = {
      username: loginForm.username,
      password: loginForm.password
    }

    const response = await loginApi(loginData)
    const result = response.data

    if (result.code === 1) {
      const userData = result.data
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        role: loginForm.userType
      }))
      
      ElMessage.success('登录成功')
      
      if (loginForm.userType === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/user/home')
      }
    } else {
      ElMessage.error(result.msg || '登录失败')
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage.error(error.response?.data?.msg || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const validateRegisterForm = () => {
  if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
    ElMessage.warning('请填写所有必填项')
    return false
  }

  // 用户名验证
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  if (!usernameRegex.test(registerForm.username)) {
    ElMessage.error('用户名格式不正确，只能包含字母、数字和下划线，长度3-20位')
    return false
  }

  // 邮箱验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.email)) {
    ElMessage.error('请输入有效的电子邮箱地址')
    return false
  }

  // 手机号验证（如果填写了的话）
  if (registerForm.phone) {
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(registerForm.phone)) {
      ElMessage.error('请输入有效的手机号码')
      return false
    }
  }

  // 密码验证
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  if (!passwordRegex.test(registerForm.password)) {
    ElMessage.error('密码必须至少8位，包含字母和数字')
    return false
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return false
  }

  if (!registerForm.agreement) {
    ElMessage.warning('请阅读并同意服务条款和隐私政策')
    return false
  }

  return true
}

const handleRegister = async () => {
  if (!validateRegisterForm()) return

  loading.value = true
  try {
    // 构造注册数据
    const registerData = {
      username: registerForm.username,
      full_name: registerForm.full_name,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password,
      role: 0,  // 默认为普通用户
      status: 1 // 默认为正常状态
    }
    
    // 使用导入的 register 方法
    const response = await register(registerData)

    if (response.code === 1) {
      ElMessage.success('注册成功，请登录')
      isLogin.value = true
      // 自动填充登录表单
      loginForm.username = registerForm.username
    } else {
      ElMessage.error(response.msg || '注册失败')
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: var(--spacing-md);
}

.login-container {
  width: 100%;
  max-width: 420px;
  background: var(--bg-primary);
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  padding-top: 20px;

  &.dark-mode {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  }
}

.login-content {
  padding: 40px;
}

.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo-container {
    width: 80px;
    height: 80px;
    margin: 0 auto 16px;
    background: var(--bg-secondary);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }

  h1 {
    margin: 16px 0 8px;
    font-size: 28px;
    font-weight: 600;
    background: linear-gradient(45deg, var(--primary-color), #00a0ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: var(--text-secondary);
    font-size: 16px;
  }
}

.login-form,
.register-form {
  .form-group {
    margin-bottom: 20px;
  }

  .form-options,
  .form-agreement {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    font-size: 14px;
  }

  .form-agreement {
    justify-content: flex-start;
  }

  .submit-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 12px;
    margin-bottom: 16px;
  }

  .form-footer {
    text-align: center;
    color: var(--text-secondary);
    font-size: 14px;

    .el-button {
      font-size: 14px;
      padding: 0 4px;
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .login-content {
    padding: 30px 20px;
  }

  .back-button {
    top: 16px;
    left: 16px;
  }

  .theme-toggle {
    top: 16px;
    right: 16px;
  }
}

.el-input-group__append {
  .el-icon {
    cursor: help;
    color: var(--text-secondary);
  }
}

.form-group {
  .el-input-group__prepend {
    padding: 0 10px;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: var(--bg-primary);
  border-color: var(--bg-secondary);
  color: var(--text-secondary);
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--primary-color);
    background: var(--bg-secondary);
    border-color: var(--primary-color);
  }
}

.user-type-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 4px;
  background: var(--bg-secondary);
  border-radius: 12px;

  .tab-item {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--text-secondary);

    .el-icon {
      font-size: 20px;
    }

    &:hover {
      color: var(--primary-color);
    }

    &.active {
      background: var(--bg-primary);
      color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}
</style> 