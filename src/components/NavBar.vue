<template>
  <el-button @click="handleLogout">退出登录</el-button>
</template>

<script setup>
import { logout } from '@/utils/auth'

const handleLogout = () => {
  logout()
}
</script> 