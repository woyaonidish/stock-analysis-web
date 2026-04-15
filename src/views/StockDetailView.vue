<template>
  <div class="stock-detail-view">
    <div class="page-card">
      <div class="page-title">
        <el-icon><DataLine /></el-icon>
        {{ stock?.name || '股票详情' }} ({{ code }})
        <el-button type="primary" link @click="goBack" style="margin-left: 20px">
          返回列表
        </el-button>
      </div>

      <!-- 基本信息 -->
      <el-row :gutter="20" v-if="stock">
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="现价" :value="stock.close_price" :precision="2">
              <template #suffix>
                <span :class="getChangeClass(calcChangeRate())">
                  {{ calcChangeRate() > 0 ? '↑' : calcChangeRate() < 0 ? '↓' : '' }}
                </span>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="涨跌幅" :value="calcChangeRate()" :precision="2">
              <template #suffix>
                <span>%</span>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="成交量" :value="formatVolume(stock.volume)" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="成交额" :value="formatAmount(stock.amount)" />
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px" v-if="stock">
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="开盘价" :value="stock.open_price || 0" :precision="2" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="最高价" :value="stock.high_price || 0" :precision="2" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="最低价" :value="stock.low_price || 0" :precision="2" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="昨收价" :value="stock.pre_close_price || 0" :precision="2" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 五档买卖盘 -->
    <div class="page-card" v-if="stock && stock.bid1">
      <div class="page-title">
        <el-icon><ShoppingCart /></el-icon>
        五档买卖盘
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="bid-panel">
            <h4>买入档位</h4>
            <el-table :data="bidData" size="small">
              <el-table-column prop="level" label="档位" width="60" />
              <el-table-column prop="price" label="价格" width="80">
                <template #default="{ row }">{{ row.price.toFixed(2) }}</template>
              </el-table-column>
              <el-table-column prop="volume" label="量" width="100" />
            </el-table>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="ask-panel">
            <h4>卖出档位</h4>
            <el-table :data="askData" size="small">
              <el-table-column prop="level" label="档位" width="60" />
              <el-table-column prop="price" label="价格" width="80">
                <template #default="{ row }">{{ row.price.toFixed(2) }}</template>
              </el-table-column>
              <el-table-column prop="volume" label="量" width="100" />
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- K线图 -->
    <div class="page-card">
      <div class="page-title">
        <el-icon><TrendCharts /></el-icon>
        K线图表
      </div>
      <div class="chart-controls">
        <el-radio-group v-model="period" @change="loadHistData">
          <el-radio-button value="daily">日线</el-radio-button>
          <el-radio-button value="weekly">周线</el-radio-button>
          <el-radio-button value="monthly">月线</el-radio-button>
        </el-radio-group>
      </div>
      <div ref="chartRef" style="height: 400px; margin-top: 20px"></div>
    </div>

    <!-- 历史数据表格 -->
    <div class="page-card">
      <div class="page-title">
        <el-icon><List /></el-icon>
        历史数据
      </div>
      <el-table :data="histData" stripe max-height="400">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="open" label="开盘" width="100">
          <template #default="{ row }">{{ row.open.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="close" label="收盘" width="100">
          <template #default="{ row }">{{ row.close.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="high" label="最高" width="100">
          <template #default="{ row }">{{ row.high.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="low" label="最低" width="100">
          <template #default="{ row }">{{ row.low.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="volume" label="成交量" width="120">
          <template #default="{ row }">{{ formatVolume(row.volume) }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="成交额" width="140">
          <template #default="{ row }">{{ formatAmount(row.amount) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getStockDetail, getStockHist } from '@/api'
import type { Stock, StockHist } from '@/types'

const router = useRouter()
const route = useRoute()
const code = route.params.code as string

const stock = ref<Stock | null>(null)
const histData = ref<StockHist[]>([])
const period = ref('daily')
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 计算涨跌幅
const calcChangeRate = (): number => {
  if (!stock.value || !stock.value.pre_close_price || stock.value.pre_close_price === 0) return 0
  return ((stock.value.close_price - stock.value.pre_close_price) / stock.value.pre_close_price) * 100
}

// 五档买卖盘数据
const bidData = computed(() => {
  if (!stock.value) return []
  return [
    { level: '买1', price: stock.value.bid1 || 0, volume: stock.value.bid1_vol || 0 },
    { level: '买2', price: stock.value.bid2 || 0, volume: stock.value.bid2_vol || 0 },
    { level: '买3', price: stock.value.bid3 || 0, volume: stock.value.bid3_vol || 0 },
    { level: '买4', price: stock.value.bid4 || 0, volume: stock.value.bid4_vol || 0 },
    { level: '买5', price: stock.value.bid5 || 0, volume: stock.value.bid5_vol || 0 }
  ].filter(d => d.price > 0)
})

const askData = computed(() => {
  if (!stock.value) return []
  return [
    { level: '卖1', price: stock.value.ask1 || 0, volume: stock.value.ask1_vol || 0 },
    { level: '卖2', price: stock.value.ask2 || 0, volume: stock.value.ask2_vol || 0 },
    { level: '卖3', price: stock.value.ask3 || 0, volume: stock.value.ask3_vol || 0 },
    { level: '卖4', price: stock.value.ask4 || 0, volume: stock.value.ask4_vol || 0 },
    { level: '卖5', price: stock.value.ask5 || 0, volume: stock.value.ask5_vol || 0 }
  ].filter(d => d.price > 0)
})

const goBack = () => {
  router.push('/stocks')
}

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

// 加载股票详情
const loadStockDetail = async () => {
  try {
    const res = await getStockDetail(code)
    if (res.code === 0) {
      stock.value = res.data
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载股票详情失败')
  }
}

// 加载历史数据
const loadHistData = async () => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 120)
    
    const res = await getStockHist(code, {
      start_date: formatDate(startDate, 'YYYYMMDD'),
      end_date: formatDate(endDate, 'YYYYMMDD'),
      period: period.value
    })
    
    if (res.code === 0) {
      histData.value = res.data.reverse()
      renderChart()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载历史数据失败')
  }
}

const formatDate = (date: Date, format: string) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  if (format === 'YYYYMMDD') return `${year}${month}${day}`
  return `${year}-${month}-${day}`
}

// 渲染K线图
const renderChart = () => {
  if (!chartRef.value) return
  
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  
  const dates = histData.value.map(d => d.date)
  const data = histData.value.map(d => [d.open, d.close, d.low, d.high])
  const volumes = histData.value.map(d => d.volume)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['K线', '成交量']
    },
    grid: [
      { left: '10%', right: '8%', height: '50%' },
      { left: '10%', right: '8%', top: '65%', height: '20%' }
    ],
    xAxis: [
      { type: 'category', data: dates, gridIndex: 0 },
      { type: 'category', data: dates, gridIndex: 1 }
    ],
    yAxis: [
      { scale: true, gridIndex: 0 },
      { gridIndex: 1 }
    ],
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: data,
        itemStyle: {
          color: '#f56c6c',
          color0: '#67c23a',
          borderColor: '#f56c6c',
          borderColor0: '#67c23a'
        }
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes,
        itemStyle: {
          color: (params: any) => {
            const idx = params.dataIndex
            const item = histData.value[idx]
            return item.close >= item.open ? '#f56c6c' : '#67c23a'
          }
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  chartInstance?.resize()
}

watch(histData, () => {
  renderChart()
})

onMounted(() => {
  loadStockDetail()
  loadHistData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style lang="scss" scoped>
.stock-detail-view {
  .chart-controls {
    display: flex;
    align-items: center;
  }

  .bid-panel, .ask-panel {
    h4 {
      margin-bottom: 10px;
      color: #606266;
    }
  }

  .bid-panel {
    h4 {
      color: #67c23a;
    }
  }

  .ask-panel {
    h4 {
      color: #f56c6c;
    }
  }
}
</style>