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
            placeholder="角色" 
            class="role-filter"
            clearable
          >
            <el-option 
              v-for="option in roleOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value" 
            />
          </el-select>
          <el-select 
            v-model="statusFilter" 
            placeholder="状态" 
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
      <div class="header-right">
        <el-button 
          type="danger" 
          @click="handleBatchDelete" 
          :disabled="!selectedUsers.length"
          class="batch-delete-button"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button type="primary" @click="handleAdd" class="add-button">
          <el-icon><Plus /></el-icon>添加用户
        </el-button>
      </div>
    </div>

    <el-card class="users-table" :body-style="{ padding: '0' }">
      <el-table
        :data="tableData"
        style="width: 100%"
        :stripe="true"
        :border="true"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
        />
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
        <el-table-column prop="role" label="角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getRoleTag(row.role).type"
              effect="light"
              size="small"
            >
              {{ getRoleTag(row.role).label }}
            </el-tag>
          </template>
        </el-table-column>
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
        label-width="100px"
        label-position="right"
        class="user-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入电话号码" />
        </el-form-item>
        <el-form-item label="姓名" prop="full_name">
          <el-input v-model="userForm.full_name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option 
              v-for="option in roleOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" style="width: 100%">
            <el-option 
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <div class="password-field">
            <el-input
              v-model="userForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
            >
              <template #append>
                <el-icon
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  <View v-if="showPassword" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
          </div>
        </el-form-item>
        <template v-if="dialogType === 'edit'">
          <el-form-item label="创建时间">
            <el-input
              v-model="userForm.create_time"
              disabled
              class="time-input"
            />
          </el-form-item>
          <el-form-item label="修改时间">
            <el-input
              v-model="userForm.update_time"
              disabled
              class="time-input"
            />
          </el-form-item>
        </template>
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
import { Edit, Delete, Plus, View, Hide } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllUsers, deleteUsers, updateUser, register } from '@/api/user'

const statusOptions = [
  { label: '正常', value: '1' },
  { label: '未激活', value: '2' },
  { label: '已封禁', value: '0' }
]

const roleOptions = [
  { label: '普通用户', value: '0' },
  { label: '会员', value: '1' },
  { label: '教练', value: '2' }
]

const loading = ref(false)
const searchQuery = ref('')
const roleFilter = ref('') // 默认不筛选角色，显示所有用户
const statusFilter = ref('') // 默认不筛选状态，显示所有用户
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const showPassword = ref(false)

const userForm = ref({
  username: '',
  email: '',
  password: '',
  phone: '',
  full_name: '',
  role: roleOptions[0].value,    // 默认显示第一个选项：普通用户
  status: statusOptions[0].value  // 默认显示第一个选项：正常
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
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  full_name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  password: [
    { required: dialogType.value === 'add', message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
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
      status: statusFilter.value || '',
      role: roleFilter.value || ''
    }

    const result = await getAllUsers(params)
    console.log('API Response:', result)
    
    if (result.code === 1) {
      users.value = result.data.filter(user => {
        const matchStatus = !statusFilter.value || user.status.toString() === statusFilter.value
        const matchRole = !roleFilter.value || user.role.toString() === roleFilter.value
        return matchStatus && matchRole
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

watch([searchQuery, statusFilter, roleFilter], () => {
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
    phone: '',
    full_name: '',
    role: roleOptions[0].value,    // 默认显示第一个选项：普通用户
    status: statusOptions[0].value  // 默认显示第一个选项：正常
  }
  showPassword.value = false
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  showPassword.value = false // 重置密码显示状态
  userForm.value = {
    user_id: row.user_id,
    username: row.username,
    email: row.email,
    phone: row.phone,
    full_name: row.full_name,
    role: row.role.toString(),
    status: row.status.toString(),
    profile_picture: row.profile_picture,
    password: row.password, // 添加密码字段
    create_time: formatDateTime(row.create_time),
    update_time: formatDateTime(row.update_time)
  }
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
  ).then(async () => {
    try {
      const response = await deleteUsers([row.user_id])
      
      if (response.code === 1) {
        ElMessage.success('删除成功')
        fetchUsers()
      } else {
        ElMessage.error(response.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
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
  
  try {
    await formRef.value.validate(async (valid) => {
      if (valid) {
        if (dialogType.value === 'edit') {
          // 构造更新数据
          const updateData = {
            user_id: userForm.value.user_id,
            username: userForm.value.username,
            email: userForm.value.email,
            phone: userForm.value.phone,
            full_name: userForm.value.full_name,
            role: userForm.value.role,
            status: userForm.value.status,
            password: userForm.value.password // 如果有修改密码的话
          }

          const response = await updateUser(userForm.value.user_id, updateData)
          
          if (response.code === 1) {
            ElMessage.success('编辑成功')
            dialogVisible.value = false
            fetchUsers() // 刷新用户列表
          } else {
            ElMessage.error(response.msg || '编辑失败')
          }
        } else {
          // 添加用户
          const registerData = {
            username: userForm.value.username,
            email: userForm.value.email,
            password: userForm.value.password,
            phone: userForm.value.phone,
            full_name: userForm.value.full_name,
            role: parseInt(userForm.value.role),
            status: parseInt(userForm.value.status)
          }

          const response = await register(registerData)
          
          if (response.code === 1) {
            ElMessage.success('添加成功')
            dialogVisible.value = false
            fetchUsers() // 刷新用户列表
          } else {
            ElMessage.error(response.msg || '添加失败')
          }
        }
      }
    })
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  }
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
  
  // 计算当前页的数据范围
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  
  // 对数据进行分页处理
  return users.value
    .map(user => ({
      ...user,
      status: user.status.toString(),
      role: user.role.toString(),
      create_time: formatDateTime(user.create_time),
      update_time: formatDateTime(user.update_time)
    }))
    .slice(startIndex, endIndex) // 只返回当前页的数据
})

// 添加选中用户数组
const selectedUsers = ref([])

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 添加批量删除方法
const handleBatchDelete = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const ids = selectedUsers.value.map(user => user.user_id)
      const response = await deleteUsers(ids)
      
      if (response.code === 1) {
        ElMessage.success('批量删除成功')
        selectedUsers.value = [] // 清空选中
        fetchUsers() // 刷新用户列表
      } else {
        ElMessage.error(response.msg || '批量删除失败')
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  })
}

// 添加角色标签的获取方法
const getRoleTag = (role) => {
  const roleStr = role.toString()
  switch (roleStr) {
    case '0':
      return { type: '', label: '普通用户' }
    case '1':
      return { type: 'success', label: '会员' }
    case '2':
      return { type: 'warning', label: '教练' }
    default:
      return { type: 'info', label: '未知' }
  }
}
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

    .header-right {
      display: flex;
      gap: 16px;
      
      .batch-delete-button {
        .el-icon {
          margin-right: 8px;
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

  .time-input {
    :deep(.el-input__wrapper) {
      background-color: var(--el-fill-color-lighter);
    }
    
    :deep(.el-input__inner) {
      color: var(--el-text-color-secondary);
      cursor: not-allowed;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.el-tag {
  &.el-tag--success {
    background-color: var(--el-color-success-light-9);
    border-color: var(--el-color-success-light-5);
    color: var(--el-color-success);
  }
  
  &.el-tag--warning {
    background-color: var(--el-color-warning-light-9);
    border-color: var(--el-color-warning-light-5);
    color: var(--el-color-warning);
  }
}

.password-field {
  .password-toggle {
    cursor: pointer;
    color: var(--el-text-color-secondary);
    font-size: 16px;
    transition: color 0.3s;
    
    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style> 