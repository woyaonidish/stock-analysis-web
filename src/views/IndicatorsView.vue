<template>
  <div class="indicators-view">
    <!-- 顶部概览卡片 -->
    <el-row :gutter="16" class="overview-cards">
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon up">
            <el-icon><ArrowUp /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ buySignals.length }}</div>
            <div class="stat-label">买入信号</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon down">
            <el-icon><ArrowDown /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ sellSignals.length }}</div>
            <div class="stat-label">卖出信号</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ macdPositiveCount }}</div>
            <div class="stat-label">MACD正值</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ kdjOver80Count }}</div>
            <div class="stat-label">KDJ超买</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ rsiOver70Count }}</div>
            <div class="stat-label">RSI超买</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ indicators.length }}</div>
            <div class="stat-label">指标总数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="page-card">
      <div class="page-title">
        <el-icon><Odometer /></el-icon>
        技术指标
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
        <el-button type="primary" @click="loadIndicators">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button type="success" @click="loadBuySignals">
          <el-icon><ArrowUp /></el-icon>
          买入信号
        </el-button>
        <el-button type="danger" @click="loadSellSignals">
          <el-icon><ArrowDown /></el-icon>
          卖出信号
        </el-button>
      </div>

      <!-- 图表区域 -->
      <el-row :gutter="16" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><PieChart /></el-icon>
                MACD分布
              </div>
            </template>
            <div ref="macdChartRef" style="height: 200px"></div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><BarChart /></el-icon>
                KDJ分布
              </div>
            </template>
            <div ref="kdjChartRef" style="height: 200px"></div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><DataLine /></el-icon>
                RSI分布
              </div>
            </template>
            <div ref="rsiChartRef" style="height: 200px"></div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><TrendCharts /></el-icon>
                信号对比
              </div>
            </template>
            <div ref="signalChartRef" style="height: 200px"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 指标列表 -->
      <el-table :data="indicators" v-loading="loading" stripe height="calc(100vh - 420px)">
        <el-table-column prop="code" label="代码" width="100" fixed />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="macd" label="MACD" width="100">
          <template #default="{ row }">
            <span :class="row.macd > 0 ? 'up' : row.macd < 0 ? 'down' : ''">
              {{ row.macd?.toFixed(3) || '--' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="macds" label="MACD信号" width="100">
          <template #default="{ row }">
            {{ row.macds?.toFixed(3) || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="macdh" label="MACD柱" width="100">
          <template #default="{ row }">
            <span :class="row.macdh > 0 ? 'up' : 'down'">
              {{ row.macdh?.toFixed(3) || '--' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="kdjk" label="KDJ-K" width="90">
          <template #default="{ row }">
            <span :class="row.kdjk > 80 ? 'down' : row.kdjk < 20 ? 'up' : ''">
              {{ row.kdjk?.toFixed(2) || '--' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="kdjd" label="KDJ-D" width="90">
          <template #default="{ row }">
            {{ row.kdjd?.toFixed(2) || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="kdjj" label="KDJ-J" width="90">
          <template #default="{ row }">
            <span :class="row.kdjj > 100 ? 'down' : row.kdjj < 0 ? 'up' : ''">
              {{ row.kdjj?.toFixed(2) || '--' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="rsi" label="RSI" width="90">
          <template #default="{ row }">
            <span :class="row.rsi > 70 ? 'down' : row.rsi < 30 ? 'up' : ''">
              {{ row.rsi?.toFixed(2) || '--' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="atr" label="ATR" width="90">
          <template #default="{ row }">
            {{ row.atr?.toFixed(3) || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="cci" label="CCI" width="90">
          <template #default="{ row }">
            <span :class="row.cci > 100 ? 'up' : row.cci < -100 ? 'down' : ''">
              {{ row.cci?.toFixed(2) || '--' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 信号弹窗 -->
    <el-dialog v-model="showSignalDialog" :title="signalDialogTitle" width="600px">
      <el-table :data="currentSignals" stripe max-height="400">
        <el-table-column prop="code" label="代码" width="120" />
        <el-table-column prop="date" label="日期" width="150" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getAllIndicators, getBuySignals, getSellSignals } from '@/api'
import type { Indicator } from '@/types'

const indicators = ref<Indicator[]>([])
const buySignals = ref<{ code: string; date: string }[]>([])
const sellSignals = ref<{ code: string; date: string }[]>([])
const loading = ref(false)
const tradeDate = ref<string>('')
const showSignalDialog = ref(false)
const signalDialogTitle = ref('')
const currentSignals = ref<{ code: string; date: string }[]>([])

const macdChartRef = ref<HTMLElement | null>(null)
const kdjChartRef = ref<HTMLElement | null>(null)
const rsiChartRef = ref<HTMLElement | null>(null)
const signalChartRef = ref<HTMLElement | null>(null)
let macdChart: echarts.ECharts | null = null
let kdjChart: echarts.ECharts | null = null
let rsiChart: echarts.ECharts | null = null
let signalChart: echarts.ECharts | null = null

// 统计计算
const macdPositiveCount = computed(() => indicators.value.filter(i => i.macd !== undefined && i.macd > 0).length)
const kdjOver80Count = computed(() => indicators.value.filter(i => i.kdjk !== undefined && i.kdjk > 80).length)
const rsiOver70Count = computed(() => indicators.value.filter(i => i.rsi !== undefined && i.rsi > 70).length)

// 渲染图表
const renderCharts = () => {
  renderMacdChart()
  renderKdjChart()
  renderRsiChart()
  renderSignalChart()
}

const renderMacdChart = () => {
  if (!macdChartRef.value) return
  if (!macdChart) macdChart = echarts.init(macdChartRef.value)
  
  const positive = indicators.value.filter(i => i.macd !== undefined && i.macd > 0).length
  const negative = indicators.value.filter(i => i.macd !== undefined && i.macd < 0).length
  const zero = indicators.value.length - positive - negative
  
  macdChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10 },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: positive, name: 'MACD>0', itemStyle: { color: '#f56c6c' } },
        { value: negative, name: 'MACD<0', itemStyle: { color: '#67c23a' } },
        { value: zero, name: 'MACD=0', itemStyle: { color: '#909399' } }
      ]
    }]
  })
}

const renderKdjChart = () => {
  if (!kdjChartRef.value) return
  if (!kdjChart) kdjChart = echarts.init(kdjChartRef.value)
  
  const over80 = indicators.value.filter(i => i.kdjk !== undefined && i.kdjk > 80).length
  const below20 = indicators.value.filter(i => i.kdjk !== undefined && i.kdjk < 20).length
  const normal = indicators.value.length - over80 - below20
  
  kdjChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10 },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: over80, name: '超买(>80)', itemStyle: { color: '#f56c6c' } },
        { value: below20, name: '超卖(<20)', itemStyle: { color: '#67c23a' } },
        { value: normal, name: '正常', itemStyle: { color: '#409eff' } }
      ]
    }]
  })
}

const renderRsiChart = () => {
  if (!rsiChartRef.value) return
  if (!rsiChart) rsiChart = echarts.init(rsiChartRef.value)
  
  const over70 = indicators.value.filter(i => i.rsi !== undefined && i.rsi > 70).length
  const below30 = indicators.value.filter(i => i.rsi !== undefined && i.rsi < 30).length
  const normal = indicators.value.length - over70 - below30
  
  rsiChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10 },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: over70, name: '超买(>70)', itemStyle: { color: '#f56c6c' } },
        { value: below30, name: '超卖(<30)', itemStyle: { color: '#67c23a' } },
        { value: normal, name: '正常', itemStyle: { color: '#409eff' } }
      ]
    }]
  })
}

const renderSignalChart = () => {
  if (!signalChartRef.value) return
  if (!signalChart) signalChart = echarts.init(signalChartRef.value)
  
  signalChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['买入信号', '卖出信号'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: [
        { value: buySignals.value.length, itemStyle: { color: '#67c23a' } },
        { value: sellSignals.value.length, itemStyle: { color: '#f56c6c' } }
      ],
      barWidth: '40%',
      label: { show: true, position: 'top', fontSize: 12 }
    }]
  })
}

const handleResize = () => {
  macdChart?.resize()
  kdjChart?.resize()
  rsiChart?.resize()
  signalChart?.resize()
}

const loadIndicators = async () => {
  loading.value = true
  try {
    const res = await getAllIndicators(tradeDate.value)
    if (res.code === 0) {
      indicators.value = res.data
      renderCharts()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载技术指标数据失败')
  } finally {
    loading.value = false
  }
}

const loadBuySignals = async () => {
  loading.value = true
  try {
    const res = await getBuySignals(tradeDate.value)
    if (res.code === 0) {
      buySignals.value = res.data
      currentSignals.value = res.data
      signalDialogTitle.value = '买入信号列表'
      showSignalDialog.value = true
      renderSignalChart()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载买入信号失败')
  } finally {
    loading.value = false
  }
}

const loadSellSignals = async () => {
  loading.value = true
  try {
    const res = await getSellSignals(tradeDate.value)
    if (res.code === 0) {
      sellSignals.value = res.data
      currentSignals.value = res.data
      signalDialogTitle.value = '卖出信号列表'
      showSignalDialog.value = true
      renderSignalChart()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载卖出信号失败')
  } finally {
    loading.value = false
  }
}

watch(indicators, renderCharts)

onMounted(() => {
  loadIndicators()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  macdChart?.dispose()
  kdjChart?.dispose()
  rsiChart?.dispose()
  signalChart?.dispose()
})
</script>

<style lang="scss" scoped>
.indicators-view {
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

    &.up { color: #67c23a; }
    &.down { color: #f56c6c; }
  }

  .stat-content {
    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #303133;
    }

    .stat-label {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
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