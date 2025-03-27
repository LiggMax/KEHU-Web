<template>
  <div class="video-ranking-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>视频播放量排行榜</span>
          <div class="filter-controls">
            <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
              <el-radio-button label="all">全部时间</el-radio-button>
              <el-radio-button label="7">最近7天</el-radio-button>
              <el-radio-button label="30">最近30天</el-radio-button>
              <el-radio-button label="90">最近90天</el-radio-button>
            </el-radio-group>
            <el-select v-model="limit" placeholder="显示数量" @change="fetchData" style="width: 120px; margin-left: 10px;">
              <el-option label="10条" :value="10"></el-option>
              <el-option label="20条" :value="20"></el-option>
              <el-option label="50条" :value="50"></el-option>
              <el-option label="100条" :value="100"></el-option>
            </el-select>
          </div>
        </div>
      </template>
      
      <el-table :data="rankingList" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="排名" width="80"></el-table-column>
        <el-table-column prop="title" label="视频标题">
          <template #default="scope">
            <div style="display: flex; align-items: center;">
              <el-image 
                v-if="scope.row.cover_url || scope.row.video_img" 
                :src="scope.row.cover_url || scope.row.video_img" 
                style="width: 80px; height: 45px; margin-right: 10px;"
                fit="cover"
                :preview-src-list="[scope.row.cover_url || scope.row.video_img]"
              ></el-image>
              <span>{{ scope.row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="view_count" label="播放量" sortable width="120"></el-table-column>
        <el-table-column prop="uploaderName" label="上传者" width="120"></el-table-column>
        <el-table-column prop="create_time" label="上传时间" width="180"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="goToVideoDetail(scope.row.id)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="chart-container" v-if="rankingList.length > 0">
        <h3>播放量分布图</h3>
        <div ref="chartRef" style="width: 100%; height: 400px;"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getVideoRankingService, getVideoRankingByDaysService } from '@/api/admin/admin.js'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  DatasetComponent, 
  TransformComponent,
  LegendComponent 
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 必需的组件
echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

const router = useRouter()
const loading = ref(false)
const rankingList = ref([])
const timeRange = ref('all')
const limit = ref(10)
const chartRef = ref(null)
let chart = null

// 格式化时间
const formatDateTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString()
}

// 初始化图表
const initChart = () => {
  if (!rankingList.value || rankingList.value.length === 0) return
  
  // 确保DOM已更新
  nextTick(() => {
    if (chart) {
      chart.dispose()
    }
    
    if (!chartRef.value) return
    
    chart = echarts.init(chartRef.value)
    
    // 准备数据
    const titles = rankingList.value.map(item => {
      // 截断过长的标题
      return item.title.length > 10 ? item.title.substring(0, 10) + '...' : item.title
    })
    const viewCounts = rankingList.value.map(item => item.view_count)
    
    // 设置图表选项
    const option = {
      title: {
        text: '视频播放量排行'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: titles,
        axisLabel: {
          rotate: 45,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        name: '播放量'
      },
      series: [
        {
          name: '播放量',
          type: 'bar',
          data: viewCounts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          }
        }
      ]
    }
    
    // 应用配置项
    chart.setOption(option)
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      chart.resize()
    })
  })
}

// 获取视频排行数据
const fetchData = async () => {
  loading.value = true
  try {
    let res
    
    if (timeRange.value === 'all') {
      res = await getVideoRankingService(limit.value)
    } else {
      res = await getVideoRankingByDaysService(parseInt(timeRange.value), limit.value)
    }
    
    if (res.code === 200) {
      // 格式化数据
      rankingList.value = res.data.map(item => {
        return {
          ...item,
          create_time: formatDateTime(item.create_time)
        }
      })
      
      // 初始化图表
      initChart()
    } else {
      ElMessage.error(res.message || '获取视频排行数据失败')
    }
  } catch (error) {
    console.error('获取视频排行数据失败:', error)
    ElMessage.error('获取视频排行数据失败')
  } finally {
    loading.value = false
  }
}

// 时间范围改变处理
const handleTimeRangeChange = () => {
  fetchData()
}

// 跳转到视频详情
const goToVideoDetail = (id) => {
  router.push(`/video/${id}`)
}

// 监听数据变化，更新图表
watch(rankingList, () => {
  nextTick(() => {
    initChart()
  })
})

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.video-ranking-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-controls {
  display: flex;
  align-items: center;
}

.chart-container {
  margin-top: 30px;
}
</style> 