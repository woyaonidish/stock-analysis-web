<template>
  <div class="strategy-view">
    <!-- 顶部概览卡片 -->
    <el-row :gutter="16" class="overview-cards">
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon">
            <el-icon><Aim /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ strategyTypes.length }}</div>
            <div class="stat-label">策略总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ strategyResults.length }}</div>
            <div class="stat-label">选中股票</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card highlight">
          <div class="stat-content">
            <div class="stat-value">{{ avgScore.toFixed(2) }}</div>
            <div class="stat-label">平均得分</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ highScoreCount }}</div>
            <div class="stat-label">高分股票(>0.8)</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ currentStrategyName }}</div>
            <div class="stat-label">当前策略</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="page-card">
      <div class="page-title">
        <el-icon><Aim /></el-icon>
        策略选股
      </div>

      <!-- 策略选择 -->
      <div class="search-bar">
        <el-select v-model="currentStrategy" placeholder="选择策略" style="width: 200px" @change="loadStrategyResult">
          <el-option v-for="s in strategyTypes" :key="s.type" :value="s.type" :label="s.name" />
        </el-select>
        <el-date-picker
          v-model="tradeDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :clearable="true"
        />
        <el-button type="primary" @click="loadStrategyResult">
          <el-icon><Search /></el-icon>
          查询结果
        </el-button>
        <el-button type="success" @click="handleRunStrategy">
          <el-icon><Play /></el-icon>
          运行策略
        </el-button>
        <el-button type="warning" @click="handleRunAllStrategies">
          <el-icon><Refresh /></el-icon>
          运行全部
        </el-button>
      </div>

      <!-- 策略说明卡片 -->
      <el-row :gutter="16" style="margin-bottom: 20px">
        <el-col :span="4" v-for="s in strategyTypes" :key="s.type">
          <el-card 
            shadow="hover" 
            class="strategy-card"
            :class="{ active: currentStrategy === s.type }"
            @click="selectStrategy(s.type)"
          >
            <div class="strategy-header">
              <el-icon class="strategy-icon"><TrendCharts /></el-icon>
              <span class="strategy-name">{{ s.name }}</span>
            </div>
            <div class="strategy-desc">{{ getStrategyDesc(s.type) }}</div>
            <div class="strategy-footer">
              <el-tag size="small" :type="currentStrategy === s.type ? 'primary' : 'info'">
                {{ s.type }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="16" style="margin-bottom: 20px">
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><PieChart /></el-icon>
                得分分布
              </div>
            </template>
            <div ref="scoreChartRef" style="height: 220px"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><BarChart /></el-icon>
                TOP10得分
              </div>
            </template>
            <div ref="topChartRef" style="height: 220px"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><Histogram /></el-icon>
                策略对比
              </div>
            </template>
            <div ref="compareChartRef" style="height: 220px"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 结果表格 -->
      <el-table :data="strategyResults" v-loading="loading" stripe height="calc(100vh - 450px)">
        <el-table-column prop="code" label="代码" width="100" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="strategy_type" label="策略类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getStrategyName(row.strategy_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.score * 100" 
              :stroke-width="15" 
              text-inside
              :color="row.score > 0.8 ? '#67c23a' : row.score > 0.5 ? '#409eff' : '#e6a23c'"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link @click="goToStockDetail(row.code)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 运行结果弹窗 -->
    <el-dialog v-model="showRunResult" title="策略运行结果" width="500px">
      <el-table :data="runResults" stripe>
        <el-table-column prop="strategy" label="策略" width="150">
          <template #default="{ row }">
            {{ getStrategyName(row.strategy) }}
          </template>
        </el-table-column>
        <el-table-column prop="count" label="选中数量" width="100" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getStrategyTypes, getStrategyResult, runStrategy, runAllStrategies } from '@/api'
import type { StrategyType, StrategyResult } from '@/types'

const router = useRouter()
const strategyTypes = ref<StrategyType[]>([])
const currentStrategy = ref('volume_up')
const strategyResults = ref<StrategyResult[]>([])
const loading = ref(false)
const tradeDate = ref<string>('')
const showRunResult = ref(false)
const runResults = ref<{ strategy: string; count: number }[]>([])

const scoreChartRef = ref<HTMLElement | null>(null)
const topChartRef = ref<HTMLElement | null>(null)
const compareChartRef = ref<HTMLElement | null>(null)
let scoreChart: echarts.ECharts | null = null
let topChart: echarts.ECharts | null = null
let compareChart: echarts.ECharts | null = null

const avgScore = computed(() => {
  if (strategyResults.value.length === 0) return 0
  return strategyResults.value.reduce((sum, r) => sum + r.score, 0) / strategyResults.value.length
})

const highScoreCount = computed(() => strategyResults.value.filter(r => r.score > 0.8).length)

const currentStrategyInfo = computed(() => {
  const info = strategyTypes.value.find(s => s.type === currentStrategy.value)
  return info ? `当前策略: ${info.name}` : ''
})

const currentStrategyName = computed(() => {
  const info = strategyTypes.value.find(s => s.type === currentStrategy.value)
  return info?.name || ''
})

const getStrategyName = (type: string) => {
  const found = strategyTypes.value.find(s => s.type === type)
  return found ? found.name : type
}

// 策略说明字典
const strategyDescriptions: Record<string, string> = {
  volume_up: '成交量放大且价格上涨，表明市场资金积极买入，趋势强劲',
  breakthrough: '价格突破前期平台整理区间，可能开启新一轮上涨行情',
  low_atr: 'ATR指标处于低位，价格波动小，适合低风险稳健操作',
  turtle: '海龟交易法则，基于突破和趋势跟踪的经典量化策略',
  high_tight_flag: '高紧旗形态，强势股票短暂整理后继续上涨',
  parking_apron: '停机坪形态，股价在高位横盘整理，蓄势待发',
  keep_increasing: '连续多日上涨，趋势延续性强，惯性上涨概率高'
}

const getStrategyDesc = (type: string) => {
  return strategyDescriptions[type] || '智能选股策略'
}

const selectStrategy = (type: string) => {
  currentStrategy.value = type
  loadStrategyResult()
}

// 渲染图表
const renderCharts = () => {
  renderScoreChart()
  renderTopChart()
  renderCompareChart()
}

const renderScoreChart = () => {
  if (!scoreChartRef.value) return
  if (!scoreChart) scoreChart = echarts.init(scoreChartRef.value)
  
  const high = strategyResults.value.filter(r => r.score > 0.8).length
  const medium = strategyResults.value.filter(r => r.score >= 0.5 && r.score <= 0.8).length
  const low = strategyResults.value.filter(r => r.score < 0.5).length
  
  scoreChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10 },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: high, name: '高分(>0.8)', itemStyle: { color: '#67c23a' } },
        { value: medium, name: '中等(0.5-0.8)', itemStyle: { color: '#409eff' } },
        { value: low, name: '低分(<0.5)', itemStyle: { color: '#e6a23c' } }
      ]
    }]
  })
}

const renderTopChart = () => {
  if (!topChartRef.value) return
  if (!topChart) topChart = echarts.init(topChartRef.value)
  
  const top10 = [...strategyResults.value].sort((a, b) => b.score - a.score).slice(0, 10)
  const codes = top10.map(r => r.code)
  const scores = top10.map(r => r.score * 100)
  
  topChart.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}: {c}分' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: codes, axisLabel: { fontSize: 10, interval: 0 } },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}分' } },
    series: [{
      type: 'bar',
      data: scores.map(s => ({
        value: s,
        itemStyle: { color: s > 80 ? '#67c23a' : s > 50 ? '#409eff' : '#e6a23c' }
      })),
      barWidth: '50%',
      label: { show: true, position: 'top', formatter: '{c}分', fontSize: 9 }
    }]
  })
}

const renderCompareChart = () => {
  if (!compareChartRef.value) return
  if (!compareChart) compareChart = echarts.init(compareChartRef.value)
  
  compareChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: strategyTypes.value.map(s => s.name), axisLabel: { fontSize: 9, interval: 0, rotate: 20 } },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: strategyTypes.value.map(s => ({
        value: s.type === currentStrategy.value ? strategyResults.value.length : 0,
        itemStyle: { color: s.type === currentStrategy.value ? '#409eff' : '#c0c4cc' }
      })),
      barWidth: '40%',
      label: { show: true, position: 'top', fontSize: 10 }
    }]
  })
}

const handleResize = () => {
  scoreChart?.resize()
  topChart?.resize()
  compareChart?.resize()
}

const loadStrategyTypes = async () => {
  try {
    const res = await getStrategyTypes()
    if (res.code === 0) {
      strategyTypes.value = res.data
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载策略类型失败')
  }
}

const loadStrategyResult = async () => {
  loading.value = true
  try {
    const res = await getStrategyResult(currentStrategy.value, tradeDate.value)
    if (res.code === 0) {
      strategyResults.value = res.data
      renderCharts()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载策略结果失败')
  } finally {
    loading.value = false
  }
}

const handleRunStrategy = async () => {
  loading.value = true
  try {
    const res = await runStrategy({
      strategy_type: currentStrategy.value,
      trade_date: tradeDate.value
    })
    if (res.code === 0) {
      ElMessage.success(`策略运行完成，选中 ${res.data.count} 只股票`)
      loadStrategyResult()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('运行策略失败')
  } finally {
    loading.value = false
  }
}

const handleRunAllStrategies = async () => {
  loading.value = true
  try {
    const res = await runAllStrategies(tradeDate.value)
    if (res.code === 0) {
      const results = Object.entries(res.data).map(([strategy, count]) => ({
        strategy,
        count
      }))
      runResults.value = results
      showRunResult.value = true
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('运行全部策略失败')
  } finally {
    loading.value = false
  }
}

const goToStockDetail = (code: string) => {
  router.push(`/stocks/${code}`)
}

watch(strategyResults, renderCharts)

onMounted(() => {
  loadStrategyTypes()
  loadStrategyResult()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  scoreChart?.dispose()
  topChart?.dispose()
  compareChart?.dispose()
})
</script>

<style lang="scss" scoped>
.strategy-view {
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

.strategy-card {
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-2px);
    border-color: #409eff;
  }

  &.active {
    border-color: #409eff;
    background: linear-gradient(135deg, #ecf5ff 0%, #f5f7fa 100%);
  }

  .strategy-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .strategy-icon {
      font-size: 20px;
      color: #409eff;
      margin-right: 8px;
    }

    .strategy-name {
      font-size: 14px;
      font-weight: bold;
      color: #303133;
    }
  }

  .strategy-desc {
    font-size: 12px;
    color: #606266;
    line-height: 1.5;
    margin-bottom: 10px;
    min-height: 36px;
  }

  .strategy-footer {
    text-align: right;
  }
}
</style>