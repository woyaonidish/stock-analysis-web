<template>
  <div class="indicators-view">
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

      <!-- 指标列表 -->
      <el-table :data="indicators" v-loading="loading" stripe height="calc(100vh - 300px)">
        <el-table-column prop="code" label="代码" width="100" fixed />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="macd" label="MACD" width="100">
          <template #default="{ row }">
            {{ row.macd?.toFixed(3) || '--' }}
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
            {{ row.kdjk?.toFixed(2) || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="kdjd" label="KDJ-D" width="90">
          <template #default="{ row }">
            {{ row.kdjd?.toFixed(2) || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="kdjj" label="KDJ-J" width="90">
          <template #default="{ row }">
            {{ row.kdjj?.toFixed(2) || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="rsi" label="RSI" width="90">
          <template #default="{ row }">
            <span :class="row.rsi > 70 ? 'down' : row.rsi < 30 ? 'up' : ''">
              {{ row.rsi?.toFixed(2) || '--' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="rsi_6" label="RSI6" width="90">
          <template #default="{ row }">
            {{ row.rsi_6?.toFixed(2) || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="atr" label="ATR" width="90">
          <template #default="{ row }">
            {{ row.atr?.toFixed(3) || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="cci" label="CCI" width="90">
          <template #default="{ row }">
            {{ row.cci?.toFixed(2) || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="wr_6" label="WR6" width="90">
          <template #default="{ row }">
            {{ row.wr_6?.toFixed(2) || '--' }}
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
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

const loadIndicators = async () => {
  loading.value = true
  try {
    const res = await getAllIndicators(tradeDate.value)
    if (res.code === 0) {
      indicators.value = res.data
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
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载卖出信号失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadIndicators()
})
</script>

<style lang="scss" scoped>
.indicators-view {
  height: 100%;
}
</style>