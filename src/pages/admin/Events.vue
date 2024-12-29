<template>
  <div class="events-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">活动管理</h2>
        <div class="header-filters">
          <el-input
            v-model="searchQuery"
            placeholder="搜索活动名称..."
            prefix-icon="Search"
            clearable
            class="search-input"
          />
          <el-select 
            v-model="statusFilter" 
            placeholder="状态" 
            class="status-filter"
            clearable
            @clear="handleStatusClear"
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
          :disabled="!selectedRows.length"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加活动
        </el-button>
      </div>
    </div>

    <el-card class="events-table">
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
        <el-table-column prop="sprots_id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="活动名称" min-width="150" />
        <el-table-column prop="description" label="活动描述" min-width="200">
          <template #default="{ row }">
            <el-tooltip
              :content="row.description"
              placement="top"
              :show-after="500"
            >
              <span class="description-text">{{ row.description }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120" align="right">
          <template #default="{ row }">
            ¥{{ Number(row.price).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="120" align="center">
          <template #default="{ row }">
            {{ Number(row.duration) }}分钟
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === '1' ? 'success' : 'danger'"
              effect="light"
            >
              {{ row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加活动' : '编辑活动'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="eventForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="eventForm.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="eventForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="eventForm.price"
            :precision="2"
            :step="0.01"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="时长" prop="duration">
          <el-input-number
            v-model="eventForm.duration"
            :min="0"
            :step="30"
            style="width: 100%"
          >
            <template #append>分钟</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="eventForm.status"
            :active-value="'1'"
            :inactive-value="'0'"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllEvents, updateEvent, deleteEvents } from '@/api/event'

// 状态选项
const statusOptions = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' }
]

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入时长', trigger: 'blur' }
  ]
}

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

// 表单数据
const eventForm = ref({
  name: '',
  description: '',
  price: 0,
  duration: 60,
  status: 1
})

// 表格数据
const events = ref([])

// 添加选中行数组
const selectedRows = ref([])

// 添加表格选择变化处理
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 获取活动列表
const fetchEvents = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      name: searchQuery.value,
      status: statusFilter.value
    }

    console.log('查询参数：', params)

    const result = await getAllEvents(params)
    
    if (result.code === 1) {
      events.value = result.data || []
      total.value = result.data.length || 0
      
      if (events.value.length === 0) {
        ElMessage.info('暂无数据')
      }
    }
  } catch (error) {
    console.error('获取活动列表失败:', error)
    ElMessage.error('获取活动列表失败')
  } finally {
    loading.value = false
  }
}

// 表格数据计算属性
const tableData = computed(() => {
  if (!events.value) return []
  
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  
  return events.value
    .map(event => ({
      ...event,
      price: Number(event.price),
      duration: Number(event.duration),
      create_time: formatDateTime(event.create_time),
      update_time: formatDateTime(event.update_time)
    }))
    .slice(startIndex, endIndex)
})

// 添加活动
const handleAdd = () => {
  dialogType.value = 'add'
  eventForm.value = {
    name: '',
    description: '',
    price: 0,
    duration: 60,
    status: 1
  }
  dialogVisible.value = true
}

// 编辑活动
const handleEdit = (row) => {
  dialogType.value = 'edit'
  eventForm.value = {
    sprots_id: row.sprots_id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    duration: Number(row.duration),
    status: row.status
  }
  dialogVisible.value = true
}

// 删除活动
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除活动 ${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deleteEvents([row.sprots_id])
      
      if (response.code === 1) {
        ElMessage.success('删除成功')
        fetchEvents()
      } else {
        ElMessage.error(response.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 添加批量删除方法
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的项目')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个项目吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const ids = selectedRows.value.map(row => row.sprots_id)
      const response = await deleteEvents(ids)
      
      if (response.code === 1) {
        ElMessage.success('批量删除成功')
        selectedRows.value = [] // 清空选中
        fetchEvents()
      } else {
        ElMessage.error(response.msg || '批量删除失败')
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate(async (valid) => {
      if (valid) {
        if (dialogType.value === 'edit') {
          // 调用更新API
          const response = await updateEvent(
            eventForm.value.sprots_id,
            eventForm.value
          )
          
          if (response.code === 1) {
            ElMessage.success('编辑成功')
            dialogVisible.value = false
            fetchEvents() // 刷新列表
          } else {
            ElMessage.error(response.msg || '编辑失败')
          }
        } else {
          // TODO: 调用添加API
          ElMessage.success('添加成功')
        }
      }
    })
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchEvents()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchEvents()
}

// 格式化日期时间
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

// 监听筛选条件变化
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
  fetchEvents()
}, { deep: true })

// 初始化
onMounted(() => {
  fetchEvents()
})

// 添加状态选择器的清除处理
const handleStatusClear = () => {
  statusFilter.value = ''
  fetchEvents()
}
</script>

<style lang="scss" scoped>
.events-page {
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

        .status-filter {
          width: 160px;
        }
      }
    }
  }

  .events-table {
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    .description-text {
      display: inline-block;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
</style> 