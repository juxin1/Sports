<template>
  <div class="admin-dashboard">
    <div class="stats-grid">
      <el-card v-for="(stat, index) in stats" :key="index" class="stat-card">
        <div class="stat-content">
          <el-icon :size="32" :color="stat.color">
            <component :is="stat.icon" />
          </el-icon>
          <div class="stat-info">
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.title }}</p>
          </div>
        </div>
      </el-card>
    </div>

    <div class="charts-section">
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <h3>场地使用统计</h3>
            <el-radio-group v-model="timeRange" size="small">
              <el-radio-button :value="'week'">本周</el-radio-button>
              <el-radio-button :value="'month'">本月</el-radio-button>
              <el-radio-button :value="'year'">本年</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <!-- 这里可以添加图表组件 -->
        <div class="chart-placeholder">
          图表区域
        </div>
      </el-card>
    </div>

    <div class="recent-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <h3>最近预约</h3>
            <el-button type="primary" link>查看全部</el-button>
          </div>
        </template>
        <el-table :data="recentBookings" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="user" label="用户" />
          <el-table-column prop="facility" label="场地" />
          <el-table-column prop="time" label="时间" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === '已确认' ? 'success' : 'warning'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllCounts } from '@/api/admin'
import { User, Calendar, ShoppingCart, Trophy } from '@element-plus/icons-vue'

const timeRange = ref('week')

// 统计数据
const stats = ref([
  {
    title: '总用户数',
    value: 0,
    icon: User,
    color: '#409EFF'
  },
  {
    title: '总订单数',
    value: 0,
    icon: ShoppingCart,
    color: '#E6A23C'
  },
  {
    title: '总活动数',
    value: 0,
    icon: Trophy,
    color: '#F56C6C'
  },
  {
    title: '今日预约',
    value: 0,
    icon: Calendar,
    color: '#67C23A'
  }
])

// 获取统计数据
const fetchAllCounts = async () => {
  try {
    const response = await getAllCounts()
    console.log('统计数据响应:', response)
    
    if (response && response.code === 1) {
      const [userCount, eventCount, orderCount] = response.data
      
      // 直接修改数组中的对象值
      stats.value = [
        {
          title: '总用户数',
          value: userCount,
          icon: User,
          color: '#409EFF'
        },
        {
          title: '总订单数',
          value: orderCount,
          icon: ShoppingCart,
          color: '#E6A23C'
        },
        {
          title: '总活动数',
          value: eventCount,
          icon: Trophy,
          color: '#F56C6C'
        },
        {
          title: '今日预约',
          value: 0,
          icon: Calendar,
          color: '#67C23A'
        }
      ]
      
      console.log('更新后的统计数据:', stats.value)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  fetchAllCounts()
})

const recentBookings = [
  {
    id: '1',
    user: '张三',
    facility: '篮球场',
    time: '2024-03-15 14:00',
    status: '已确认'
  },
  {
    id: '2',
    user: '李四',
    facility: '网球场',
    time: '2024-03-15 15:00',
    status: '待确认'
  }
  // 更多数据...
]
</script>

<style lang="scss" scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .stat-info {
        h3 {
          font-size: 24px;
          margin-bottom: 4px;
        }

        p {
          color: var(--text-secondary);
          font-size: 14px;
        }
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chart-placeholder {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border-radius: 8px;
    color: var(--text-secondary);
  }
}
</style> 