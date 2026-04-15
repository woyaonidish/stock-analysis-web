<template>
  <div class="patterns-view">
    <div class="page-card">
      <div class="page-title">
        <el-icon><Connection /></el-icon>
        K线形态识别
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
        <el-button type="primary" @click="loadPatternList">
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
        <el-button type="warning" @click="handleCalculateAll">
          <el-icon><Refresh /></el-icon>
          批量计算
        </el-button>
      </div>

      <!-- 信号统计 -->
      <el-row :gutter="16" style="margin-bottom: 20px">
        <el-col :span="4">
          <el-statistic title="买入信号" :value="buySignals.length">
            <template #suffix>
              <span style="color: #67c23a">↑</span>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="4">
          <el-statistic title="卖出信号" :value="sellSignals.length">
            <template #suffix>
              <span style="color: #f56c6c">↓</span>
            </template>
          </el-statistic>
        </el-col>
      </el-row>

      <!-- 形态列表 -->
      <el-table :data="patternList" v-loading="loading" stripe height="calc(100vh - 300px)">
        <el-table-column prop="code" label="代码" width="100" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="识别形态" min-width="300">
          <template #default="{ row }">
            <el-tag v-for="(value, key) in row.patterns" :key="key" 
              :type="value > 0 ? 'success' : 'danger'" 
              style="margin-right: 5px">
              {{ getPatternName(key) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 信号弹窗 -->
    <el-dialog v-model="showSignalDialog" :title="signalDialogTitle" width="600px">
      <el-table :data="currentSignals" stripe max-height="400">
        <el-table-column prop="code" label="代码" width="100" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="pattern" label="形态" width="150">
          <template #default="{ row }">
            {{ getPatternName(row.pattern) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPatternList, getPatternBuySignals, getPatternSellSignals, calculateAllPatterns } from '@/api'
import type { Pattern, PatternSignal } from '@/types'

const patternList = ref<Pattern[]>([])
const buySignals = ref<PatternSignal[]>([])
const sellSignals = ref<PatternSignal[]>([])
const loading = ref(false)
const tradeDate = ref<string>('')
const showSignalDialog = ref(false)
const signalDialogTitle = ref('')
const currentSignals = ref<PatternSignal[]>([])

// 形态名称映射
const patternNames: Record<string, string> = {
  hammer: '锤子线',
  inverted_hammer: '倒锤子线',
  hanging_man: '上吊线',
  shooting_star: '流星线',
  bullish_engulfing: '看涨吞没',
  bearish_engulfing: '看跌吞没',
  morning_star: '启明星',
  evening_star: '黄昏星',
  three_white_soldiers: '三白兵',
  three_black_crows: '三只乌鸦',
  doji: '十字星',
  dragonfly_doji: '蜻蜓十字星',
  gravestone_doji: '墓碑十字星',
  dark_cloud_cover: '乌云盖顶',
  piercing_line: '刺透形态',
  bullish_harami: '看涨孕育',
  bearish_harami: '看跌孕育'
}

const getPatternName = (key: string): string => {
  return patternNames[key] || key
}

const loadPatternList = async () => {
  loading.value = true
  try {
    const res = await getPatternList(tradeDate.value)
    if (res.code === 0) {
      patternList.value = res.data
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载形态数据失败')
  } finally {
    loading.value = false
  }
}

const loadBuySignals = async () => {
  loading.value = true
  try {
    const res = await getPatternBuySignals(tradeDate.value)
    if (res.code === 0) {
      buySignals.value = res.data
      currentSignals.value = res.data
      signalDialogTitle.value = 'K线形态买入信号'
      showSignalDialog.value = true
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
    const res = await getPatternSellSignals(tradeDate.value)
    if (res.code === 0) {
      sellSignals.value = res.data
      currentSignals.value = res.data
      signalDialogTitle.value = 'K线形态卖出信号'
      showSignalDialog.value = true
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载卖出信号失败')
  } finally {
    loading.value = false
  }
}

const handleCalculateAll = async () => {
  loading.value = true
  try {
    const res = await calculateAllPatterns(tradeDate.value)
    if (res.code === 0) {
      ElMessage.success(`成功计算 ${res.data.count} 只股票形态`)
      loadPatternList()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('批量计算失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPatternList()
})
</script>

<style lang="scss" scoped>
.patterns-view {
  height: 100%;
}
</style>