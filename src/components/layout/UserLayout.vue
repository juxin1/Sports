<template>
  <div class="user-layout">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo">
            <el-icon><Platform /></el-icon>
            <span>科创园体育</span>
          </div>
          
          <el-menu
            mode="horizontal"
            :router="true"
            :default-active="activeMenu"
          >
            <el-menu-item index="/user/home">首页</el-menu-item>
            <el-menu-item index="/user/facilities">场地预约</el-menu-item>
            <el-menu-item index="/user/events">活动报名</el-menu-item>
            <el-menu-item index="/user/bookings">我的预约</el-menu-item>
          </el-menu>

          <div class="user-actions">
            <el-button
              circle
              @click="toggleTheme"
              :icon="isDark ? 'Sunny' : 'Moon'"
            />
            <el-dropdown @command="handleCommand">
              <el-avatar :size="32" :src="userAvatar">
                {{ username.charAt(0) }}
              </el-avatar>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>

      <el-footer>
        <div class="footer-content">
          <p>&copy; {{ new Date().getFullYear() }} 科创园体育服务. 保留所有权利</p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const isDark = ref(false)
const userAvatar = ref('')

const username = computed(() => {
  const user = JSON.parse(localStorage.getItem('user'))
  return user?.username || '未登录'
})

const activeMenu = computed(() => route.path)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      localStorage.removeItem('user')
      router.push('/login')
    })
  }
}
</script>

<style lang="scss" scoped>
.user-layout {
  min-height: 100vh;

  .el-container {
    min-height: 100vh;
  }

  .el-header {
    background: var(--bg-primary);
    border-bottom: 1px solid var(--bg-secondary);
    padding: 0;

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--spacing-md);

      .logo {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--primary-color);
      }

      .user-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
      }
    }
  }

  .el-main {
    background: var(--bg-secondary);
    padding: 0;
  }

  .el-footer {
    background: var(--bg-primary);
    border-top: 1px solid var(--bg-secondary);

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--spacing-md);
      text-align: center;
      color: var(--text-secondary);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-layout {
    .el-menu {
      display: none;
    }
  }
}
</style> 