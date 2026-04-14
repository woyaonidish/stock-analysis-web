<template>
  <div class="etf-view">
    <div class="page-card">
      <div class="page-title">
        <el-icon><PieChart /></el-icon>
        ETF数据
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
        <el-button type="primary" @click="loadETFs">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button type="warning" @click="handleFetchData">
          <el-icon><Download /></el-icon>
          抓取数据
        </el-button>
      </div>

      <!-- 数据统计 -->
      <el-row :gutter="16" style="margin-bottom: 20px">
        <el-col :span="4">
          <el-statistic title="ETF总数" :value="etfs.length" />
        </el-col>
        <el-col :span="4">
          <el-statistic title="上涨数量" :value="upCount">
            <template #suffix>
              <span style="color: #f56c6c">↑</span>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="4">
          <el-statistic title="下跌数量" :value="downCount">
            <template #suffix>
              <span style="color: #67c23a">↓</span>
            </template>
          </el-statistic>
        </el-col>
      </el-row>

      <!-- ETF列表 -->
      <el-table :data="etfs" v-loading="loading" stripe height="calc(100vh - 280px)">
        <el-table-column prop="code" label="代码" width="100" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="new_price" label="最新价" width="100">
          <template #default="{ row }">
            <span :class="getChangeClass(row.change_rate)">
              {{ row.new_price.toFixed(3) }}
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
        <el-table-column prop="change_amount" label="涨跌额" width="100">
          <template #default="{ row }">
            <span :class="getChangeClass(row.change_rate)">
              {{ (row.change_amount || 0).toFixed(3) }}
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
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getETFList, fetchETFData } from '@/api'
import type { ETF } from '@/types'

const etfs = ref<ETF[]>([])
const loading = ref(false)
const tradeDate = ref<string>('')

const upCount = computed(() => etfs.value.filter(e => e.change_rate > 0).length)
const downCount = computed(() => etfs.value.filter(e => e.change_rate < 0).length)

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

const loadETFs = async () => {
  loading.value = true
  try {
    const res = await getETFList(tradeDate.value)
    if (res.code === 0) {
      etfs.value = res.data
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载ETF数据失败')
  } finally {
    loading.value = false
  }
}

const handleFetchData = async () => {
  loading.value = true
  try {
    const res = await fetchETFData(tradeDate.value)
    if (res.code === 0) {
      ElMessage.success(`成功抓取 ${res.data.count} 条数据`)
      loadETFs()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('抓取数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadETFs()
})
</script>

<style lang="scss" scoped>
.etf-view {
  height: 100%;
}
</style>