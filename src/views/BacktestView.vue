<template>
  <div class="backtest-view">
    <div class="page-card">
      <div class="page-title">
        <el-icon><Timer /></el-icon>
        策略回测
      </div>

      <!-- 回测参数设置 -->
      <div class="search-bar">
        <el-select v-model="strategyType" placeholder="选择策略" style="width: 200px">
          <el-option v-for="s in strategyTypes" :key="s.type" :value="s.type" :label="s.name" />
        </el-select>
        <el-date-picker
          v-model="startDate"
          type="date"
          placeholder="开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-date-picker
          v-model="endDate"
          type="date"
          placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-input-number
          v-model="initialCapital"
          placeholder="初始资金"
          :min="10000"
          :step="10000"
          style="width: 150px"
        />
        <el-button type="primary" @click="handleRunBacktest" :loading="loading">
          <el-icon><Play /></el-icon>
          运行回测
        </el-button>
        <el-button type="success" @click="handleRunAllBacktests" :loading="loadingAll">
          <el-icon><Refresh /></el-icon>
          回测全部策略
        </el-button>
      </div>

      <!-- 单个策略回测结果 -->
      <div v-if="backtestResult" class="backtest-result">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover" class="result-card">
              <el-statistic title="总收益率" :value="backtestResult.total_return" :precision="2">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-statistic>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="result-card">
              <el-statistic title="年化收益" :value="backtestResult.annual_return" :precision="2">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-statistic>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="result-card">
              <el-statistic title="最大回撤" :value="backtestResult.max_drawdown" :precision="2">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-statistic>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="result-card">
              <el-statistic title="夏普比率" :value="backtestResult.sharpe_ratio" :precision="2" />
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="6">
            <el-card shadow="hover" class="result-card">
              <el-statistic title="胜率" :value="backtestResult.win_rate" :precision="2">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-statistic>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="result-card">
              <el-statistic title="总交易次数" :value="backtestResult.total_trades" />
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 全部策略回测结果对比 -->
      <div v-if="allBacktestResults" class="all-results">
        <h3 style="margin-bottom: 20px">策略对比</h3>
        <el-table :data="allBacktestResultsTable" stripe>
          <el-table-column prop="strategy" label="策略" width="150">
            <template #default="{ row }">
              {{ getStrategyName(row.strategy) }}
            </template>
          </el-table-column>
          <el-table-column prop="total_return" label="总收益率(%)" width="120">
            <template #default="{ row }">
              <span :class="row.total_return > 0 ? 'up' : 'down'">
                {{ row.total_return.toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="annual_return" label="年化收益(%)" width="120">
            <template #default="{ row }">
              {{ row.annual_return.toFixed(2) }}%
            </template>
          </el-table-column>
          <el-table-column prop="max_drawdown" label="最大回撤(%)" width="120">
            <template #default="{ row }">
              <span class="down">{{ row.max_drawdown.toFixed(2) }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="sharpe_ratio" label="夏普比率" width="100">
            <template #default="{ row }">
              {{ row.sharpe_ratio.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="win_rate" label="胜率(%)" width="100">
            <template #default="{ row }">
              {{ row.win_rate.toFixed(2) }}%
            </template>
          </el-table-column>
          <el-table-column prop="total_trades" label="交易次数" width="100" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getStrategyTypes, runBacktest, runAllBacktests } from '@/api'
import type { StrategyType, BacktestResult } from '@/types'

const strategyTypes = ref<StrategyType[]>([])
const strategyType = ref('volume_up')
const startDate = ref<string>('')
const endDate = ref<string>('')
const initialCapital = ref(100000)
const loading = ref(false)
const loadingAll = ref(false)
const backtestResult = ref<BacktestResult | null>(null)
const allBacktestResults = ref<Record<string, BacktestResult> | null>(null)

// 默认日期范围
const initDefaultDates = () => {
  const end = new Date()
  const start = new Date()
  start.setFullYear(start.getFullYear() - 1)
  startDate.value = formatDate(start)
  endDate.value = formatDate(end)
}

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const allBacktestResultsTable = computed(() => {
  if (!allBacktestResults.value) return []
  return Object.entries(allBacktestResults.value).map(([strategy, result]) => ({
    strategy,
    ...result
  }))
})

const getStrategyName = (type: string) => {
  const found = strategyTypes.value.find(s => s.type === type)
  return found ? found.name : type
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

const handleRunBacktest = async () => {
  if (!startDate.value || !endDate.value) {
    ElMessage.warning('请选择日期范围')
    return
  }
  
  loading.value = true
  backtestResult.value = null
  try {
    const res = await runBacktest({
      strategy_type: strategyType.value,
      start_date: startDate.value,
      end_date: endDate.value,
      initial_capital: initialCapital.value
    })
    if (res.code === 0) {
      backtestResult.value = res.data
      ElMessage.success('回测完成')
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('运行回测失败')
  } finally {
    loading.value = false
  }
}

const handleRunAllBacktests = async () => {
  if (!startDate.value || !endDate.value) {
    ElMessage.warning('请选择日期范围')
    return
  }
  
  loadingAll.value = true
  allBacktestResults.value = null
  try {
    const res = await runAllBacktests({
      start_date: startDate.value,
      end_date: endDate.value
    })
    if (res.code === 0) {
      allBacktestResults.value = res.data
      ElMessage.success('全部策略回测完成')
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('运行全部回测失败')
  } finally {
    loadingAll.value = false
  }
}

onMounted(() => {
  initDefaultDates()
  loadStrategyTypes()
})
</script>

<style lang="scss" scoped>
.backtest-view {
  .result-card {
    text-align: center;
  }

  .backtest-result,
  .all-results {
    margin-top: 30px;
  }
}
</style>