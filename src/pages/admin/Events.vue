<template>
  <div class="events-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">运动项目管理</h2>
        <div class="header-filters">
          <el-input
            v-model="searchQuery"
            placeholder="搜索项目名称..."
            prefix-icon="Search"
            clearable
            class="search-input"
          />
          <el-select 
            v-model="statusFilter" 
            placeholder="状态" 
            clearable
            class="status-filter"
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
          :disabled="!selectedEvents.length"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button 
          type="primary" 
          @click="handleAdd"
        >
          <el-icon><Plus /></el-icon>
          添加项目
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
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="sprots_id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="项目名称" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="price" label="价格" width="120" align="center">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="120" align="center">
          <template #default="{ row }">
            {{ row.duration }}分钟
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type">
              {{ getStatusTag(row.status).label }}
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
              <el-button type="primary" text @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" text @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
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
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'
import { getAllEvents, deleteEvents } from '@/api/event'

// 状态选项
const statusOptions = [
  { value: '1', label: '启用' },
  { value: '0', label: '禁用' }
]

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const selectedEvents = ref([])

// 获取状态标签
const getStatusTag = (status) => {
  return status === '1' ? 
    { type: 'success', label: '启用' } : 
    { type: 'danger', label: '禁用' }
}

// 格式化日期时间
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

// 获取运动项目列表
const fetchEvents = async () => {
  loading.value = true
  try {
    const { data: response } = await getAllEvents({
      page: currentPage.value,
      size: pageSize.value,
      name: searchQuery.value,
      status: statusFilter.value
    })
    console.log('API响应:', response)
    
    if (response.code === 1) {
      // 计算当前页的数据
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      tableData.value = response.data.slice(startIndex, endIndex)
      total.value = response.data.length
      
      console.log('处理后的数据:', {
        tableData: tableData.value,
        total: total.value,
        currentPage: currentPage.value,
        pageSize: pageSize.value,
        startIndex,
        endIndex
      })
    } else {
      ElMessage.error(response.msg || '获取运动项目列表失败')
    }
  } catch (error) {
    console.error('获取运动项目列表失败:', error)
    ElMessage.error('获取运动项目列表失败')
  } finally {
    loading.value = false
  }
}

// 处理表格选择
const handleSelectionChange = (selection) => {
  selectedEvents.value = selection
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchEvents()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchEvents()
}

// 监听筛选条件变化
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1  // 搜索或筛选时重置为第一页
  fetchEvents()
})

// 页面加载时获取数据
onMounted(() => {
  fetchEvents()
})
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

    .header-right {
      display: flex;
      gap: 16px;
    }
  }

  .events-table {
    .table-footer {
      padding: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style> 