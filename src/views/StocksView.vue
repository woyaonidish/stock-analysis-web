<template>
  <div class="stocks-view">
    <!-- 顶部概览卡片 -->
    <el-row :gutter="16" class="overview-cards">
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
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon flat">
            <el-icon><Minus /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ flatCount }}</div>
            <div class="stat-label">平盘股票</div>
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
            <div class="stat-value">{{ formatAmount(totalAmount) }}</div>
            <div class="stat-label">总成交额</div>
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
    </el-row>

    <div class="page-card">
      <div class="page-title">
        <el-icon><DataLine /></el-icon>
        股票数据
      </div>
      
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-date-picker
          v-model="tradeDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :clearable="true"
        />
        <el-input
          v-model="searchKeyword"
          placeholder="搜索股票代码或名称"
          :clearable="true"
          style="width: 200px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button type="success" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button type="warning" @click="handleFetchData">
          <el-icon><Download /></el-icon>
          抓取数据
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
                <el-icon><Histogram /></el-icon>
                涨跌幅分布
              </div>
            </template>
            <div ref="histChartRef" style="height: 200px"></div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><BarChart /></el-icon>
                成交量TOP10
              </div>
            </template>
            <div ref="volumeChartRef" style="height: 200px"></div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><DataLine /></el-icon>
                涨幅TOP10
              </div>
            </template>
            <div ref="topChartRef" style="height: 200px"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 股票列表 -->
      <el-table
        :data="stocks"
        v-loading="loading"
        stripe
        height="calc(100vh - 420px)"
        @row-click="handleRowClick"
      >
        <el-table-column prop="code" label="代码" width="100" fixed />
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="close_price" label="现价" width="90">
          <template #default="{ row }">
            <span :class="getChangeClass(calcChangeRate(row))">
              {{ formatPrice(row.close_price) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="涨跌幅(%)" width="90">
          <template #default="{ row }">
            <span :class="getChangeClass(calcChangeRate(row))">
              {{ calcChangeRate(row).toFixed(2) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="open_price" label="开盘" width="90">
          <template #default="{ row }">
            {{ formatPrice(row.open_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="high_price" label="最高" width="90">
          <template #default="{ row }">
            {{ formatPrice(row.high_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="low_price" label="最低" width="90">
          <template #default="{ row }">
            {{ formatPrice(row.low_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="volume" label="成交量" width="100">
          <template #default="{ row }">
            {{ formatVolume(row.volume) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="成交额" width="100">
          <template #default="{ row }">
            {{ formatAmount(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column label="买一" width="120">
          <template #default="{ row }">
            <span v-if="row.bid1">{{ formatPrice(row.bid1) }}/{{ row.bid1_vol }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="卖一" width="120">
          <template #default="{ row }">
            <span v-if="row.ask1">{{ formatPrice(row.ask1) }}/{{ row.ask1_vol }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="goToDetail(row.code)">
              详情
            </el-button>
            <el-button 
              :type="attentionCodes.includes(row.code) ? 'warning' : 'success'" 
              link 
              @click.stop="handleAttention(row.code)"
            >
              {{ attentionCodes.includes(row.code) ? '取消' : '关注' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getStockList, searchStock, fetchDailyData, getAttentionCodes, addAttention, removeAttention } from '@/api'
import type { Stock } from '@/types'

const router = useRouter()
const stocks = ref<Stock[]>([])
const loading = ref(false)
const tradeDate = ref<string>('')
const searchKeyword = ref('')
const attentionCodes = ref<string[]>([])

const pieChartRef = ref<HTMLElement | null>(null)
const histChartRef = ref<HTMLElement | null>(null)
const volumeChartRef = ref<HTMLElement | null>(null)
const topChartRef = ref<HTMLElement | null>(null)
let pieChart: echarts.ECharts | null = null
let histChart: echarts.ECharts | null = null
let volumeChart: echarts.ECharts | null = null
let topChart: echarts.ECharts | null = null

// 计算涨跌幅
const calcChangeRate = (stock: Stock): number => {
  if (!stock.pre_close_price || stock.pre_close_price === 0) return 0
  return ((stock.close_price - stock.pre_close_price) / stock.pre_close_price) * 100
}

// 统计计算
const upCount = computed(() => stocks.value.filter(s => calcChangeRate(s) > 0).length)
const downCount = computed(() => stocks.value.filter(s => calcChangeRate(s) < 0).length)
const flatCount = computed(() => stocks.value.filter(s => calcChangeRate(s) === 0).length)
const avgChangeRate = computed(() => {
  if (stocks.value.length === 0) return 0
  return stocks.value.reduce((sum, s) => sum + calcChangeRate(s), 0) / stocks.value.length
})
const totalAmount = computed(() => stocks.value.reduce((sum, s) => sum + s.amount, 0))
const maxUpRate = computed(() => {
  if (stocks.value.length === 0) return 0
  return Math.max(...stocks.value.map(s => calcChangeRate(s)))
})
const maxDownRate = computed(() => {
  if (stocks.value.length === 0) return 0
  return Math.min(...stocks.value.map(s => calcChangeRate(s)))
})

// 格式化函数
const formatPrice = (val?: number) => val ? val.toFixed(2) : '--'
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

const getChangeClass = (rate: number) => {
  if (rate > 0) return 'up'
  if (rate < 0) return 'down'
  return 'flat'
}

// 渲染图表
const renderCharts = () => {
  renderPieChart()
  renderHistChart()
  renderVolumeChart()
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

const renderHistChart = () => {
  if (!histChartRef.value) return
  if (!histChart) histChart = echarts.init(histChartRef.value)
  
  // 涨跌幅区间分布
  const ranges = ['<-5%', '-5~-3%', '-3~-1%', '-1~0%', '0~1%', '1~3%', '3~5%', '>5%']
  const counts = [0, 0, 0, 0, 0, 0, 0, 0]
  stocks.value.forEach(s => {
    const r = calcChangeRate(s)
    if (r < -5) counts[0]++
    else if (r < -3) counts[1]++
    else if (r < -1) counts[2]++
    else if (r < 0) counts[3]++
    else if (r < 1) counts[4]++
    else if (r < 3) counts[5]++
    else if (r < 5) counts[6]++
    else counts[7]++
  })
  
  histChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ranges, axisLabel: { fontSize: 10, interval: 0 } },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: counts.map((c, i) => ({
        value: c,
        itemStyle: { color: i < 4 ? '#67c23a' : '#f56c6c' }
      })),
      barWidth: '60%'
    }]
  })
}

const renderVolumeChart = () => {
  if (!volumeChartRef.value) return
  if (!volumeChart) volumeChart = echarts.init(volumeChartRef.value)
  
  const top10 = [...stocks.value].sort((a, b) => b.volume - a.volume).slice(0, 10)
  const names = top10.map(s => s.name)
  const volumes = top10.map(s => s.volume / 10000)
  
  volumeChart.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}: {c}万' },
    grid: { left: '3%', right: '4%', bottom: '20%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: names, axisLabel: { fontSize: 9, interval: 0, rotate: 20 } },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}万', fontSize: 10 } },
    series: [{
      type: 'bar',
      data: volumes,
      barWidth: '50%',
      itemStyle: { color: '#409eff', borderRadius: [4, 4, 0, 0] }
    }]
  })
}

const renderTopChart = () => {
  if (!topChartRef.value) return
  if (!topChart) topChart = echarts.init(topChartRef.value)
  
  const top10 = [...stocks.value].sort((a, b) => calcChangeRate(b) - calcChangeRate(a)).slice(0, 10)
  const names = top10.map(s => s.name)
  const rates = top10.map(s => calcChangeRate(s))
  
  topChart.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
    grid: { left: '3%', right: '4%', bottom: '20%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: names, axisLabel: { fontSize: 9, interval: 0, rotate: 20 } },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%', fontSize: 10 } },
    series: [{
      type: 'bar',
      data: rates.map(r => ({
        value: r,
        itemStyle: { color: '#f56c6c' }
      })),
      barWidth: '50%',
      label: { show: true, position: 'top', formatter: '{c}%', fontSize: 9 }
    }]
  })
}

const handleResize = () => {
  pieChart?.resize()
  histChart?.resize()
  volumeChart?.resize()
  topChart?.resize()
}

// 加载关注列表
const loadAttentionCodes = async () => {
  try {
    const res = await getAttentionCodes()
    if (res.code === 0) {
      attentionCodes.value = res.data
    }
  } catch (error) {
    // 忽略错误
  }
}

// 加载股票列表
const loadStocks = async () => {
  loading.value = true
  try {
    const res = await getStockList(tradeDate.value)
    if (res.code === 0) {
      stocks.value = res.data
      renderCharts()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载股票数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索股票
const handleSearch = async () => {
  if (!searchKeyword.value) {
    loadStocks()
    return
  }
  loading.value = true
  try {
    const res = await searchStock(searchKeyword.value, tradeDate.value)
    if (res.code === 0) {
      stocks.value = res.data
      renderCharts()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const handleRefresh = () => {
  searchKeyword.value = ''
  loadStocks()
}

// 抓取数据
const handleFetchData = async () => {
  loading.value = true
  try {
    const res = await fetchDailyData(tradeDate.value)
    if (res.code === 0) {
      ElMessage.success(`成功抓取 ${res.data.count} 条数据`)
      loadStocks()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('抓取数据失败')
  } finally {
    loading.value = false
  }
}

// 关注/取消关注
const handleAttention = async (code: string) => {
  try {
    if (attentionCodes.value.includes(code)) {
      const res = await removeAttention(code)
      if (res.code === 0) {
        ElMessage.success('已取消关注')
        attentionCodes.value = attentionCodes.value.filter(c => c !== code)
      } else {
        ElMessage.error(res.message)
      }
    } else {
      const res = await addAttention(code)
      if (res.code === 0) {
        ElMessage.success('已添加关注')
        attentionCodes.value.push(code)
      } else {
        ElMessage.error(res.message)
      }
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 点击行跳转详情
const handleRowClick = (row: Stock) => {
  goToDetail(row.code)
}

const goToDetail = (code: string) => {
  router.push(`/stocks/${code}`)
}

watch(stocks, renderCharts)

onMounted(() => {
  loadAttentionCodes()
  loadStocks()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  histChart?.dispose()
  volumeChart?.dispose()
  topChart?.dispose()
})
</script>

<style lang="scss" scoped>
.stocks-view {
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

    &.up { color: #f56c6c; }
    &.down { color: #67c23a; }
    &.flat { color: #909399; }
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

.el-table {
  cursor: pointer;
}
</style>