<template>
  <div class="users-page">
    <el-loading 
      :full-screen="true" 
      :visible="loading"
      text="加载中..."
    />
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">用户管理</h2>
        <div class="header-filters">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户名/邮箱..."
            prefix-icon="Search"
            clearable
            class="search-input"
          />
          <el-select 
            v-model="roleFilter" 
            placeholder="用户类型" 
            class="role-filter"
            clearable
          >
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
          <el-select 
            v-model="statusFilter" 
            placeholder="用户状态" 
            class="status-filter"
            clearable
          >
            <el-option 
              v-for="option in statusOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value" 
            />
          </el-select>
        </div>
      </div>
      <el-button type="primary" @click="handleAdd" class="add-button">
        <el-icon><Plus /></el-icon>添加用户
      </el-button>
    </div>

    <el-card class="users-table" :body-style="{ padding: '0' }">
      <el-table
        :data="tableData"
        style="width: 100%"
        :stripe="true"
        :border="true"
        v-loading="loading"
      >
        <el-table-column prop="user_id" label="ID" width="80" align="center" />
        <el-table-column prop="profile_picture" label="头像" width="100" align="center">
          <template #default="{ row }">
            <el-avatar 
              :src="row.profile_picture" 
              :size="40"
              class="user-avatar"
            >
              {{ row.username.charAt(0).toUpperCase() }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="电话" min-width="120" />
        <el-table-column prop="full_name" label="姓名" min-width="120" />
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTag(row.status).type"
              effect="light"
              size="small"
            >
              {{ getStatusTag(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group class="operation-buttons">
              <el-button
                type="primary"
                :icon="Edit"
                @click="handleEdit(row)"
                text
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                :icon="Delete"
                @click="handleDelete(row)"
                text
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty 
            description="暂无数据" 
            :image-size="100"
          />
        </template>
      </el-table>

      <div class="table-footer">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="userForm"
        :rules="rules"
        label-width="80px"
        label-position="right"
        class="user-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item 
          label="密码" 
          prop="password"
          v-if="dialogType === 'add' || showPasswordField"
        >
          <el-input 
            v-model="userForm.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllUsers } from '@/api/user'

const statusOptions = [
  { label: '正常', value: '1' },
  { label: '未激活', value: '2' },
  { label: '已封禁', value: '0' }
]

const loading = ref(false)
const searchQuery = ref('')
const roleFilter = ref('user') // 默认显示普通用户
const statusFilter = ref('') // 默认不筛选状态，显示所有用户
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const showPasswordField = ref(false)

const userForm = ref({
  username: '',
  email: '',
  password: '',
  phone: '',
  full_name: '',
  profile_picture: '',
  status: '1' // 修改为字符串 '1'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const users = ref([])

const fetchUsers = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      name: searchQuery.value,
      status: statusFilter.value || '' // 如果没有选择状态，传空字符串查询所有
    }

    const result = await getAllUsers(params)
    console.log('API Response:', result)
    
    if (result.code === 1) {
      // 根据状态筛选数据
      users.value = result.data.filter(user => {
        // 如果没有选择状态，显示所有用户
        if (!statusFilter.value) return true
        // 否则根据选择的状态筛选
        return user.status.toString() === statusFilter.value
      })
      total.value = users.value.length
      
      if (users.value.length === 0) {
        ElMessage.info('暂无数据')
      }
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error(error.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

watch([searchQuery, statusFilter], () => {
  try {
    currentPage.value = 1
    fetchUsers()
  } catch (error) {
    console.error('Watch error:', error)
    ElMessage.error('数据刷新失败')
  }
}, { deep: true })

const handleAdd = () => {
  dialogType.value = 'add'
  userForm.value = {
    username: '',
    email: '',
    password: '',
    role: 'user'
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  userForm.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${row.username} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 调用删除API
    ElMessage.success('删除成功')
  })
}

const handleStatusChange = async (row) => {
  try {
    // TODO: 调用状态更新API
    const newStatus = row.status === '1' ? '0' : '1' // 使用字符串比较和赋值
    ElMessage.success(`状态更新成功：${newStatus === '1' ? '正常' : '已封禁'}`)
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用添加/编辑API
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '编辑成功')
      dialogVisible.value = false
    }
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUsers()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUsers()
}

onMounted(() => {
  fetchUsers()
})

const getStatusTag = (status) => {
  const statusStr = status.toString()
  switch (statusStr) {
    case '1':
      return { type: 'success', label: '正常' }
    case '2':
      return { type: 'warning', label: '未激活' }
    case '0':
      return { type: 'danger', label: '已封禁' }
    default:
      return { type: 'info', label: '未知' }
  }
}

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const tableData = computed(() => {
  if (!users.value) return []
  
  return users.value.map(user => ({
    ...user,
    status: user.status.toString(), // 确保状态值为字符串
    create_time: formatDateTime(user.create_time),
    update_time: formatDateTime(user.update_time)
  }))
})
</script>

<style lang="scss" scoped>
.users-page {
  padding: 24px;
  height: 100%;
  background: var(--el-bg-color-page);

  .page-header {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .header-left {
      .page-title {
        margin: 0 0 16px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .header-filters {
        display: flex;
        gap: 16px;
        
        .search-input {
          width: 240px;
        }

        .role-filter,
        .status-filter {
          width: 160px;
        }
      }
    }

    .add-button {
      padding: 12px 20px;
      font-weight: 500;
      
      .el-icon {
        margin-right: 8px;
      }
    }
  }

  .users-table {
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    .user-avatar {
      transition: transform 0.3s;
      cursor: pointer;
      
      &:hover {
        transform: scale(1.1);
      }
    }

    .role-tag {
      padding: 4px 12px;
      border-radius: 4px;
    }

    .status-switch {
      :deep(.el-switch__label) {
        font-size: 12px;
      }
    }

    .operation-buttons {
      .el-button {
        padding: 8px 16px;
        transition: all 0.3s;
        
        &:hover {
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }
      }
    }

    .table-footer {
      padding: 16px;
      display: flex;
      justify-content: flex-end;
      background: var(--el-bg-color);
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }
}

:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-bg-color-page);
  
  th {
    font-weight: 600;
    background: var(--el-bg-color-page) !important;
  }

  .el-table__row {
    transition: background-color 0.3s;
    
    &:hover {
      background-color: var(--el-color-primary-light-9) !important;
    }
  }
}

.user-form {
  padding: 20px;
  
  .el-form-item {
    margin-bottom: 24px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style> 