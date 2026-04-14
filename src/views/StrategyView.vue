<template>
  <div class="strategy-view">
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

      <!-- 策略说明 -->
      <el-alert
        :title="currentStrategyInfo"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      />

      <!-- 策略结果 -->
      <el-row :gutter="16" style="margin-bottom: 20px">
        <el-col :span="4">
          <el-statistic title="选中股票数" :value="strategyResults.length" />
        </el-col>
        <el-col :span="4">
          <el-statistic title="平均得分" :value="avgScore" :precision="2" />
        </el-col>
      </el-row>

      <!-- 结果表格 -->
      <el-table :data="strategyResults" v-loading="loading" stripe height="calc(100vh - 350px)">
        <el-table-column prop="code" label="代码" width="100" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="strategy_type" label="策略类型" width="120">
          <template #default="{ row }">
            {{ getStrategyName(row.strategy_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.score * 100" :stroke-width="15" text-inside />
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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

const avgScore = computed(() => {
  if (strategyResults.value.length === 0) return 0
  return strategyResults.value.reduce((sum, r) => sum + r.score, 0) / strategyResults.value.length
})

const currentStrategyInfo = computed(() => {
  const info = strategyTypes.value.find(s => s.type === currentStrategy.value)
  return info ? `当前策略: ${info.name}` : ''
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

const loadStrategyResult = async () => {
  loading.value = true
  try {
    const res = await getStrategyResult(currentStrategy.value, tradeDate.value)
    if (res.code === 0) {
      strategyResults.value = res.data
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

onMounted(() => {
  loadStrategyTypes()
  loadStrategyResult()
})
</script>

<style lang="scss" scoped>
.strategy-view {
  height: 100%;
}
</style>