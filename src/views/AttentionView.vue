<template>
  <div class="attention-view">
    <!-- 顶部概览卡片 -->
    <el-row :gutter="16" class="overview-cards">
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ attentionList.length }}</div>
            <div class="stat-label">关注总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon up">
            <el-icon><ArrowUp /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ upCount }}</div>
            <div class="stat-label">上涨股票</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon down">
            <el-icon><ArrowDown /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ downCount }}</div>
            <div class="stat-label">下跌股票</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card highlight">
          <div class="stat-content">
            <div class="stat-value" :class="avgChangeRate >= 0 ? 'up' : 'down'">
              {{ avgChangeRate.toFixed(2) }}%
            </div>
            <div class="stat-label">平均涨跌幅</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value up">{{ maxUpRate.toFixed(2) }}%</div>
            <div class="stat-label">最大涨幅</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value down">{{ maxDownRate.toFixed(2) }}%</div>
            <div class="stat-label">最大跌幅</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ formatAmount(totalAmount) }}</div>
            <div class="stat-label">总成交额</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="page-card">
      <div class="page-title">
        <el-icon><Star /></el-icon>
        关注股票
      </div>

      <!-- 操作栏 -->
      <div class="search-bar">
        <el-date-picker
          v-model="tradeDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :clearable="true"
        />
        <el-button type="primary" @click="loadAttentionList">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button type="danger" @click="handleClearAll">
          <el-icon><Delete /></el-icon>
          清空关注
        </el-button>
      </div>

      <!-- 图表区域 -->
      <el-row :gutter="16" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><PieChart /></el-icon>
                涨跌分布
              </div>
            </template>
            <div ref="pieChartRef" style="height: 200px"></div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><BarChart /></el-icon>
                涨跌幅对比
              </div>
            </template>
            <div ref="barChartRef" style="height: 200px"></div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><DataLine /></el-icon>
                成交额对比
              </div>
            </template>
            <div ref="amountChartRef" style="height: 200px"></div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><TrendCharts /></el-icon>
                涨幅TOP5
              </div>
            </template>
            <div ref="topChartRef" style="height: 200px"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 关注列表 -->
      <el-table :data="attentionList" v-loading="loading" stripe height="calc(100vh - 420px)">
        <el-table-column prop="code" label="代码" width="100" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="close_price" label="现价" width="100">
          <template #default="{ row }">
            <span :class="getChangeClass(row.change_rate)">
              {{ row.close_price.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="change_rate" label="涨跌幅(%)" width="100">
          <template #default="{ row }">
            <span :class="getChangeClass(row.change_rate)">
              {{ row.change_rate.toFixed(2) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="volume" label="成交量" width="120">
          <template #default="{ row }">
            {{ formatVolume(row.volume) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="成交额" width="140">
          <template #default="{ row }">
            {{ formatAmount(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goToDetail(row.code)">
              详情
            </el-button>
            <el-button type="danger" link @click="handleRemove(row.code)">
              取消关注
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && attentionList.length === 0" description="暂无关注股票，请在股票列表中添加关注" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { getAttentionList, removeAttention, clearAttention } from '@/api'
import type { AttentionStock } from '@/types'

const router = useRouter()
const attentionList = ref<AttentionStock[]>([])
const loading = ref(false)
const tradeDate = ref<string>('')

const pieChartRef = ref<HTMLElement | null>(null)
const barChartRef = ref<HTMLElement | null>(null)
const amountChartRef = ref<HTMLElement | null>(null)
const topChartRef = ref<HTMLElement | null>(null)
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null
let amountChart: echarts.ECharts | null = null
let topChart: echarts.ECharts | null = null

const upCount = computed(() => attentionList.value.filter(s => s.change_rate > 0).length)
const downCount = computed(() => attentionList.value.filter(s => s.change_rate < 0).length)
const flatCount = computed(() => attentionList.value.filter(s => s.change_rate === 0).length)
const avgChangeRate = computed(() => {
  if (attentionList.value.length === 0) return 0
  return attentionList.value.reduce((sum, s) => sum + s.change_rate, 0) / attentionList.value.length
})
const totalAmount = computed(() => attentionList.value.reduce((sum, s) => sum + s.amount, 0))
const maxUpRate = computed(() => {
  if (attentionList.value.length === 0) return 0
  return Math.max(...attentionList.value.map(s => s.change_rate))
})
const maxDownRate = computed(() => {
  if (attentionList.value.length === 0) return 0
  return Math.min(...attentionList.value.map(s => s.change_rate))
})

const getChangeClass = (rate: number) => {
  if (rate > 0) return 'up'
  if (rate < 0) return 'down'
  return 'flat'
}

const formatVolume = (val: number) => {
  if (val >= 100000000) return (val / 100000000).toFixed(2) + '亿'
  if (val >= 10000) return (val / 10000).toFixed(2) + '万'
  return val.toString()
}

const formatAmount = (val: number) => {
  if (val >= 100000000) return (val / 100000000).toFixed(2) + '亿'
  if (val >= 10000) return (val / 10000).toFixed(2) + '万'
  return val.toFixed(2)
}

// 渲染图表
const renderCharts = () => {
  renderPieChart()
  renderBarChart()
  renderAmountChart()
  renderTopChart()
}

const renderPieChart = () => {
  if (!pieChartRef.value) return
  if (!pieChart) pieChart = echarts.init(pieChartRef.value)
  
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10 },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: upCount.value, name: '上涨', itemStyle: { color: '#f56c6c' } },
        { value: downCount.value, name: '下跌', itemStyle: { color: '#67c23a' } },
        { value: flatCount.value, name: '平盘', itemStyle: { color: '#909399' } }
      ]
    }]
  })
}

const renderBarChart = () => {
  if (!barChartRef.value) return
  if (!barChart) barChart = echarts.init(barChartRef.value)
  
  const names = attentionList.value.map(s => s.name)
  const rates = attentionList.value.map(s => s.change_rate)
  
  barChart.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
    grid: { left: '3%', right: '4%', bottom: '20%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: names, axisLabel: { fontSize: 9, interval: 0, rotate: 20 } },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%', fontSize: 10 } },
    series: [{
      type: 'bar',
      data: rates.map(r => ({
        value: r,
        itemStyle: { color: r >= 0 ? '#f56c6c' : '#67c23a' }
      })),
      barWidth: '50%'
    }]
  })
}

const renderAmountChart = () => {
  if (!amountChartRef.value) return
  if (!amountChart) amountChart = echarts.init(amountChartRef.value)
  
  const names = attentionList.value.map(s => s.name)
  const amounts = attentionList.value.map(s => s.amount / 100000000)
  
  amountChart.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}: {c}亿' },
    grid: { left: '3%', right: '4%', bottom: '20%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: names, axisLabel: { fontSize: 9, interval: 0, rotate: 20 } },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}亿', fontSize: 10 } },
    series: [{
      type: 'bar',
      data: amounts,
      barWidth: '50%',
      itemStyle: { color: '#409eff', borderRadius: [4, 4, 0, 0] }
    }]
  })
}

const renderTopChart = () => {
  if (!topChartRef.value) return
  if (!topChart) topChart = echarts.init(topChartRef.value)
  
  const top5 = [...attentionList.value].sort((a, b) => b.change_rate - a.change_rate).slice(0, 5)
  const names = top5.map(s => s.name)
  const rates = top5.map(s => s.change_rate)
  
  topChart.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: names, axisLabel: { fontSize: 10, interval: 0 } },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%', fontSize: 10 } },
    series: [{
      type: 'bar',
      data: rates.map(r => ({
        value: r,
        itemStyle: { color: '#f56c6c' }
      })),
      barWidth: '40%',
      label: { show: true, position: 'top', formatter: '{c}%', fontSize: 10 }
    }]
  })
}

const handleResize = () => {
  pieChart?.resize()
  barChart?.resize()
  amountChart?.resize()
  topChart?.resize()
}

const loadAttentionList = async () => {
  loading.value = true
  try {
    const res = await getAttentionList(tradeDate.value)
    if (res.code === 0) {
      attentionList.value = res.data
      renderCharts()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载关注列表失败')
  } finally {
    loading.value = false
  }
}

const handleRemove = async (code: string) => {
  try {
    await ElMessageBox.confirm('确认取消关注该股票?', '提示', { type: 'warning' })
    const res = await removeAttention(code)
    if (res.code === 0) {
      ElMessage.success('已取消关注')
      loadAttentionList()
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {
    // 用户取消
  }
}

const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm('确认清空所有关注股票?', '提示', { type: 'warning' })
    const res = await clearAttention()
    if (res.code === 0) {
      ElMessage.success(`已清空 ${res.data.count} 只关注股票`)
      attentionList.value = []
      renderCharts()
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {
    // 用户取消
  }
}

const goToDetail = (code: string) => {
  router.push(`/stocks/${code}`)
}

watch(attentionList, renderCharts)

onMounted(() => {
  loadAttentionList()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  barChart?.dispose()
  amountChart?.dispose()
  topChart?.dispose()
})
</script>

<style lang="scss" scoped>
.attention-view {
  height: 100%;
}

.overview-cards {
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
  padding: 10px;

  .stat-icon {
    font-size: 24px;
    margin-bottom: 8px;
    color: #409eff;

    &.up { color: #f56c6c; }
    &.down { color: #67c23a; }
  }

  .stat-content {
    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #303133;

      &.up { color: #f56c6c; }
      &.down { color: #67c23a; }
    }

    .stat-label {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }

  &.highlight {
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  }
}

.chart-header {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;

  .el-icon {
    margin-right: 6px;
    color: #409eff;
  }
}
</style>