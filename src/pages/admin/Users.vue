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
      :title="dialogTitle"
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

const roleOptions = [
  { value: '0', label: '普通用户' },
  { value: '1', label: '会员' },
  { value: '2', label: '教练' }
]

const statusOptions = [
  { value: '1', label: '启用' },
  { value: '0', label: '禁用' }
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
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
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
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const users = ref([])

const tableData = ref([])

const fetchUsers = async () => {
  loading.value = true
  try {
    const { data: response } = await getAllUsers({
      page: currentPage.value,
      size: pageSize.value,
      name: searchQuery.value || '',
      status: statusFilter.value || '1',
      role: roleFilter.value || '0'
    })
    console.log('获取到的原始响应:', response)

    if (response.code === 1 && response.data) {
      // 直接使用返回的数据数组
      tableData.value = response.data
      total.value = response.data.length
      console.log('处理后的表格数据:', tableData.value)
    } else {
      ElMessage.error(response.msg || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUsers()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUsers()
}

// 修改对话框标题计算属性
const dialogTitle = computed(() => dialogType.value === 'add' ? '添加用户' : '编辑用户')

// 添加表单变化检测
const originalForm = ref(null)
const formChanged = ref(false)

// 修改处理编辑用户方法
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 复制用户数据到表单，包括原密码
  const formData = {
    user_id: row.user_id,
    username: row.username,
    email: row.email,
    phone: row.phone,
    full_name: row.full_name,
    role: String(row.role),
    status: String(row.status),
    password: row.password, // 保留原密码
    create_time: formatDateTime(row.create_time),
    update_time: formatDateTime(row.update_time)
  }
  
  userForm.value = formData
  // 保存原始表单数据用于比较
  originalForm.value = { ...formData }
  formChanged.value = false
  dialogVisible.value = true
}

// 监听表单变化
watch(
  () => userForm.value,
  (newVal) => {
    if (originalForm.value) {
      // 检查是否有任何字段发生变化
      formChanged.value = Object.keys(newVal).some(key => {
        // 忽略时间字段的比较
        if (key === 'create_time' || key === 'update_time') return false
        return newVal[key] !== originalForm.value[key]
      })
    }
  },
  { deep: true }
)

// 修改表单提交方法
const handleSubmit = async () => {
  if (!formRef.value) return
  
  if (dialogType.value === 'edit' && !formChanged.value) {
    dialogVisible.value = false
    return
  }
  
  try {
    await formRef.value.validate()
    
    if (dialogType.value === 'edit') {
      // 构造更新数据，包含所有字段的当前值
      const updateData = {
        user_id: userForm.value.user_id,
        username: userForm.value.username,
        email: userForm.value.email,
        phone: userForm.value.phone || originalForm.value.phone, // 如果为空则使用原值
        full_name: userForm.value.full_name,
        role: userForm.value.role,
        status: userForm.value.status,
        password: userForm.value.password || originalForm.value.password // 如果为空则使用原密码
      }

      // 移除未修改的字段
      Object.keys(updateData).forEach(key => {
        // 跳过 user_id，它是必需的
        if (key === 'user_id') return
        
        // 如果值与原值相同，或者新值为空而原值存在，则使用原值
        if (updateData[key] === originalForm.value[key] || 
            (!updateData[key] && originalForm.value[key])) {
          updateData[key] = originalForm.value[key]
        }
      })

      console.log('提交的更新数据:', updateData)
      const response = await updateUser(userForm.value.user_id, updateData)
      
      if (response.data.code === 1) {
        ElMessage.success('修改成功')
        dialogVisible.value = false
        fetchUsers() // 刷新用户列表
      } else {
        ElMessage.error(response.data.msg || '修改失败')
      }
    } else {
      // 处理添加用户
      const userData = {
        username: userForm.value.username,
        password: userForm.value.password,
        email: userForm.value.email,
        phone: userForm.value.phone,
        full_name: userForm.value.full_name,
        role: userForm.value.role,
        status: userForm.value.status
      }

      const response = await register(userData)
      
      if (response.data.code === 1) {
        ElMessage.success('添加成功')
        dialogVisible.value = false
        fetchUsers() // 刷新用户列表
      } else {
        ElMessage.error(response.data.msg || '添加失败')
      }
    }
  } catch (error) {
    console.error('表单提交失败:', error)
    ElMessage.error('表单验证失败，请检查输入')
  }
}

// 监听筛选条件变化
watch([searchQuery, roleFilter, statusFilter], () => {
  currentPage.value = 1 // 重置到第一页
  fetchUsers()
})

// 页面加载时获取数据
onMounted(() => {
  fetchUsers()
})

const getStatusTag = (status) => {
  return String(status) === '1' ? 
    { type: 'success', label: '启用' } : 
    { type: 'danger', label: '禁用' }
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
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

const getRoleLabel = (role) => {
  const roleMap = {
    '0': '普通用户',
    '1': '会员',
    '2': '教练'
  }
  return roleMap[String(role)] || '未知'
}

const getRoleTagType = (role) => {
  const typeMap = {
    '0': 'info',
    '1': 'success',
    '2': 'warning'
  }
  return typeMap[String(role)] || 'info'
}

// 添加选中用户数组
const selectedUsers = ref([])

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 处理单个删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.username}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deleteUsers([row.user_id])
      
      if (response.data.code === 1) {
        ElMessage.success('删除成功')
        // 如果当前页只有一条数据，且不是第一页，则跳转到上一页
        if (tableData.value.length === 1 && currentPage.value > 1) {
          currentPage.value--
        }
        fetchUsers() // 刷新用户列表
      } else {
        ElMessage.error(response.data.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 处理批量删除
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
      // 提取选中用户的ID数组
      const ids = selectedUsers.value.map(user => user.user_id)
      const response = await deleteUsers(ids)
      
      if (response.data.code === 1) {
        ElMessage.success('批量删除成功')
        selectedUsers.value = [] // 清空选中
        // 如果删除后当前页没有数据，且不是第一页，则跳转到上一页
        if (tableData.value.length === ids.length && currentPage.value > 1) {
          currentPage.value--
        }
        fetchUsers() // 刷新用户列表
      } else {
        ElMessage.error(response.data.msg || '批量删除失败')
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

// 添加处理添加用户的方法
const handleAdd = () => {
  dialogType.value = 'add'
  // 重置表单数据
  userForm.value = {
    username: '',
    email: '',
    password: '',
    phone: '',
    full_name: '',
    role: roleOptions[0].value,    // 默认普通用户
    status: statusOptions[0].value  // 默认启用
  }
  // 清空原始表单数据
  originalForm.value = null
  formChanged.value = false
  dialogVisible.value = true
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