<template>
  <div class="user-home">
    <div class="hero-section">
      <h1>欢迎使用科创园体育服务</h1>
      <p>在这里，您可以轻松预约场地、参与活动</p>
    </div>

    <div class="quick-actions">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="action-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Calendar /></el-icon>
                <span>场地预约</span>
              </div>
            </template>
            <el-button type="primary" class="action-btn">立即预约</el-button>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="action-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Trophy /></el-icon>
                <span>活动报名</span>
              </div>
            </template>
            <el-button type="primary" class="action-btn">浏览活动</el-button>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="action-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>我的预约</span>
              </div>
            </template>
            <el-button type="primary" class="action-btn">查看记录</el-button>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="facilities-section">
      <h2>热门场地</h2>
      <el-row :gutter="20">
        <el-col v-for="facility in facilities" :key="facility.id" :span="8">
          <el-card class="facility-card" shadow="hover">
            <img :src="facility.image" class="facility-image" />
            <h3>{{ facility.name }}</h3>
            <p>{{ facility.description }}</p>
            <div class="facility-footer">
              <span class="price">¥{{ facility.price }}/小时</span>
              <el-button type="primary" size="small">预约</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const facilities = ref([
  {
    id: 1,
    name: '标准篮球场',
    description: '室内标准篮球场，配备专业照明系统',
    price: 100,
    image: '/images/basketball.jpg' // 需要添加实际图片
  },
  {
    id: 2,
    name: '网球场',
    description: '专业网球场，全天候地面',
    price: 80,
    image: '/images/tennis.jpg' // 需要添加实际图片
  },
  {
    id: 3,
    name: '羽毛球场',
    description: '室内羽毛球场，木地板，空调',
    price: 60,
    image: '/images/badminton.jpg' // 需要添加实际图片
  }
])
</script>

<style lang="scss" scoped>
.user-home {
  padding: var(--spacing-lg);

  .hero-section {
    text-align: center;
    margin-bottom: var(--spacing-xl);

    h1 {
      font-size: 2.5rem;
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
    }

    p {
      font-size: 1.2rem;
      color: var(--text-secondary);
    }
  }

  .quick-actions {
    margin-bottom: var(--spacing-xl);

    .action-card {
      height: 100%;
      
      .card-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 1.2rem;
      }

      .action-btn {
        width: 100%;
      }
    }
  }

  .facilities-section {
    h2 {
      font-size: 1.8rem;
      margin-bottom: var(--spacing-lg);
      color: var(--text-primary);
    }

    .facility-card {
      margin-bottom: var(--spacing-lg);

      .facility-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: var(--spacing-sm);
      }

      h3 {
        font-size: 1.2rem;
        margin-bottom: var(--spacing-xs);
      }

      p {
        color: var(--text-secondary);
        margin-bottom: var(--spacing-sm);
      }

      .facility-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .price {
          font-size: 1.2rem;
          color: var(--primary-color);
          font-weight: 600;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-home {
    padding: var(--spacing-md);

    .hero-section {
      h1 {
        font-size: 2rem;
      }
    }

    .el-col {
      width: 100%;
      margin-bottom: var(--spacing-md);
    }
  }
}
</style> 