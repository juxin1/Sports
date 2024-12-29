<template>
  <div class="orders-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">订单管理</h2>
        <div class="header-filters">
          <el-input
            v-model="usernameQuery"
            placeholder="搜索用户名..."
            prefix-icon="Search"
            clearable
            class="search-input"
          />
          <el-input
            v-model="searchQuery"
            placeholder="搜索活动名称..."
            prefix-icon="Search"
            clearable
            class="search-input"
          />
          <el-select 
            v-model="statusFilter" 
            placeholder="订单状态" 
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
          :disabled="!selectedRows.length"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
    </div>

    <el-card class="orders-table">
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
        <el-table-column prop="order_id" label="订单号" width="100" align="center" />
        <el-table-column label="用户信息" min-width="180">
          <template #default="{ row }">
            <div>
              <div>{{ row.username }}</div>
              <div class="text-secondary">(ID: {{ row.user_id }})</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="活动信息" min-width="180">
          <template #default="{ row }">
            <div>
              <div>{{ row.name }}</div>
              <div class="text-secondary">(ID: {{ row.sprots_id }})</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="total_price" label="总价" width="120" align="right">
          <template #default="{ row }">
            <span class="price">¥{{ Number(row.total_price).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
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

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑订单"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="orderForm"
        :rules="rules"
        label-width="100px"
      >
        <!-- 只读信息展示 -->
        <el-form-item label="订单号">
          <el-input v-model="orderForm.order_id" disabled />
        </el-form-item>
        <el-form-item label="用户信息">
          <el-input :value="`${orderForm.username} (ID: ${orderForm.user_id})`" disabled />
        </el-form-item>
        <el-form-item label="活动信息">
          <el-input :value="`${orderForm.name} (ID: ${orderForm.sprots_id})`" disabled />
        </el-form-item>
        <el-form-item label="数量">
          <el-input v-model="orderForm.quantity" disabled />
        </el-form-item>
        
        <!-- 可编辑字段 -->
        <el-form-item label="总价" prop="total_price">
          <el-input-number
            v-model="orderForm.total_price"
            :precision="2"
            :step="0.01"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="orderForm.status" style="width: 100%">
            <el-option 
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
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
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllOrders, deleteOrders, updateOrder } from '@/api/order'

// 状态选项
const statusOptions = [
  { label: '待付款', value: '1' },
  { label: '已付款', value: '2' },
  { label: '已完成', value: '3' },
  { label: '已取消', value: '0' }
]

// 获取状态标签
const getStatusLabel = (status) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option ? option.label : '未知'
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case '1': return 'warning'  // 待付款
    case '2': return 'primary'  // 已付款
    case '3': return 'success'  // 已完成
    case '0': return 'danger'   // 已取消
    default: return 'info'
  }
}

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref('edit')
const formRef = ref(null)

// 表单数据
const orderForm = ref({
  order_id: '',
  user_id: '',
  username: '',
  sprots_id: '',
  name: '',
  quantity: 0,
  total_price: 0,
  status: '1'
})

// 表格数据
const orders = ref([])

// 表格数据计算属性
const tableData = computed(() => {
  if (!orders.value) return []
  
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  
  return orders.value
    .map(order => ({
      ...order,
      total_price: Number(order.total_price),
      create_time: formatDateTime(order.create_time)
    }))
    .slice(startIndex, endIndex)
})

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

// 添加用户名搜索
const usernameQuery = ref('')

// 修改获取订单列表方法
const fetchOrders = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      username: usernameQuery.value,
      name: searchQuery.value,
      status: statusFilter.value
    }

    console.log('查询参数：', params)

    const result = await getAllOrders(params)
    
    if (result.code === 1) {
      // 直接使用返回的数据数组
      orders.value = result.data || []
      total.value = result.data.length || 0
      
      if (orders.value.length === 0) {
        ElMessage.info('暂无数据')
      }
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 修改分页处理方法
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1  // 重置到第一页
  fetchOrders()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchOrders()
}

// 添加监听器
watch([usernameQuery, searchQuery, statusFilter], () => {
  currentPage.value = 1
  fetchOrders()
}, { deep: true })

// 初始化
onMounted(() => {
  fetchOrders()
})

// 添加选中行数组
const selectedRows = ref([])

// 添加表格选择变化处理
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 修改单个删除方法
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除订单 ${row.order_id} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deleteOrders([row.order_id])
      
      if (response.code === 1) {
        ElMessage.success('删除成功')
        fetchOrders()
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
    ElMessage.warning('请选择要删除的订单')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个订单吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const ids = selectedRows.value.map(row => row.order_id)
      const response = await deleteOrders(ids)
      
      if (response.code === 1) {
        ElMessage.success('批量删除成功')
        selectedRows.value = [] // 清空选中
        fetchOrders()
      } else {
        ElMessage.error(response.msg || '批量删除失败')
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  })
}

// 修改表单验证规则
const rules = {
  total_price: [
    { required: true, message: '请输入总价', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择订单状态', trigger: 'change' }
  ]
}

// 修改编辑方法
const handleEdit = (row) => {
  dialogType.value = 'edit'
  orderForm.value = {
    order_id: row.order_id,
    user_id: row.user_id,
    username: row.username,
    sprots_id: row.sprots_id,
    name: row.name,
    quantity: row.quantity,
    total_price: Number(row.total_price),
    status: row.status
  }
  dialogVisible.value = true
}

// 修改提交方法
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate(async (valid) => {
      if (valid) {
        const response = await updateOrder(
          orderForm.value.order_id,
          {
            total_price: orderForm.value.total_price,
            status: orderForm.value.status
          }
        )
        
        if (response.code === 1) {
          ElMessage.success('编辑成功')
          dialogVisible.value = false
          fetchOrders() // 刷新列表
        } else {
          ElMessage.error(response.msg || '编辑失败')
        }
      }
    })
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  }
}
</script>

<style lang="scss" scoped>
.orders-page {
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

  .orders-table {
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    .table-footer {
      padding: 16px;
      display: flex;
      justify-content: flex-end;
      background: var(--el-bg-color);
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }
}

.text-secondary {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.price {
  font-weight: 600;
  color: var(--el-color-danger);
}
</style> 