<template>
  <div class="admin-layout" :class="{ 'is-collapsed': isCollapsed }">
    <div class="sidebar">
      <div class="logo">
        <el-icon :size="24"><Platform /></el-icon>
        <span v-show="!isCollapsed">管理后台</span>
      </div>
      
      <el-menu
        :collapse="isCollapsed"
        :default-active="activeMenu"
        class="sidebar-menu"
        @select="handleSelect"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>控制台</template>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/events">
          <el-icon><List /></el-icon>
          <template #title>活动管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/orders">
          <el-icon><ShoppingCart /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
      </el-menu>
    </div>

    <div class="main-content">
      <div class="header">
        <el-button
          :icon="isCollapsed ? 'Expand' : 'Fold'"
          @click="toggleCollapse"
        />
        <div class="header-right">
          <el-button
            circle
            @click="toggleTheme"
            :icon="isDark ? 'Sunny' : 'Moon'"
          />
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              {{ username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { 
  DataBoard, 
  User, 
  List, 
  ShoppingCart,
  Expand, 
  Fold, 
  Moon, 
  Sunny, 
  ArrowDown 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const isCollapsed = ref(false)
const isDark = ref(false)

const username = computed(() => {
  const user = JSON.parse(localStorage.getItem('user'))
  return user?.username || '未登录'
})

const activeMenu = computed(() => route.path)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

const handleSelect = (index) => {
  router.push(index)
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
.admin-layout {
  min-height: 100vh;
  display: flex;

  .sidebar {
    width: 240px;
    background: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color-lighter);
    transition: width 0.3s;
    
    .logo {
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 12px;
      color: var(--el-color-primary);
      font-size: 18px;
      font-weight: 600;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
  }

  &.is-collapsed {
    .sidebar {
      width: 64px;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--el-bg-color-page);
    
    .header {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      background: var(--el-bg-color);
      border-bottom: 1px solid var(--el-border-color-lighter);

      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .user-dropdown {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.3s;

        &:hover {
          background: var(--el-color-primary-light-9);
        }
      }
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  &.is-active {
    background: var(--el-color-primary-light-9);
  }
}
</style> 