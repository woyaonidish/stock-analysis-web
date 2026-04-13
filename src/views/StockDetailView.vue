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
            <el-statistic title="最新价" :value="stock.new_price" :precision="2">
              <template #suffix>
                <span :class="getChangeClass(stock.change_rate)">
                  {{ stock.change_rate > 0 ? '↑' : stock.change_rate < 0 ? '↓' : '' }}
                </span>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="涨跌幅" :value="stock.change_rate" :precision="2">
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
        <el-select v-model="adjust" placeholder="复权类型" @change="loadHistData" style="margin-left: 20px; width: 120px">
          <el-option value="" label="不复权" />
          <el-option value="qfq" label="前复权" />
          <el-option value="hfq" label="后复权" />
        </el-select>
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
          <template #default="{ row }">
            <span :class="getChangeClass(row.change_pct || 0)">
              {{ row.close.toFixed(2) }}
            </span>
          </template>
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
        <el-table-column prop="change_pct" label="涨跌幅(%)" width="100">
          <template #default="{ row }">
            <span :class="getChangeClass(row.change_pct || 0)">
              {{ (row.change_pct || 0).toFixed(2) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="turnover" label="换手率(%)" width="100">
          <template #default="{ row }">{{ (row.turnover || 0).toFixed(2) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
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
const adjust = ref('')
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

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
      period: period.value,
      adjust: adjust.value
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
}
</style>