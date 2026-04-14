<template>
  <div class="stocks-view">
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

      <!-- 数据统计 -->
      <el-row :gutter="16" style="margin-bottom: 20px">
        <el-col :span="4">
          <el-statistic title="股票总数" :value="stocks.length" />
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

      <!-- 股票列表 -->
      <el-table
        :data="stocks"
        v-loading="loading"
        stripe
        height="calc(100vh - 280px)"
        @row-click="handleRowClick"
      >
        <el-table-column prop="code" label="代码" width="100" fixed />
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="new_price" label="最新价" width="100">
          <template #default="{ row }">
            <span :class="getChangeClass(row.change_rate)">
              {{ formatPrice(row.new_price) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="change_rate" label="涨跌幅(%)" width="100">
          <template #default="{ row }">
            <span :class="getChangeClass(row.change_rate)">
              {{ formatChangeRate(row.change_rate) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="change_amount" label="涨跌额" width="100">
          <template #default="{ row }">
            <span :class="getChangeClass(row.change_rate)">
              {{ formatPrice(row.change_amount) }}
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
        <el-table-column prop="open_price" label="开盘价" width="90">
          <template #default="{ row }">
            {{ formatPrice(row.open_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="high_price" label="最高价" width="90">
          <template #default="{ row }">
            {{ formatPrice(row.high_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="low_price" label="最低价" width="90">
          <template #default="{ row }">
            {{ formatPrice(row.low_price) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="goToDetail(row.code)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStockList, searchStock, fetchDailyData } from '@/api'
import type { Stock } from '@/types'

const router = useRouter()
const stocks = ref<Stock[]>([])
const loading = ref(false)
const tradeDate = ref<string>('')
const searchKeyword = ref('')

// 统计计算
const upCount = computed(() => stocks.value.filter(s => s.change_rate > 0).length)
const downCount = computed(() => stocks.value.filter(s => s.change_rate < 0).length)

// 格式化函数
const formatPrice = (val?: number) => val ? val.toFixed(2) : '--'
const formatChangeRate = (val: number) => val.toFixed(2)
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

// 加载股票列表
const loadStocks = async () => {
  loading.value = true
  try {
    const res = await getStockList(tradeDate.value)
    if (res.code === 0) {
      stocks.value = res.data
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

// 点击行跳转详情
const handleRowClick = (row: Stock) => {
  goToDetail(row.code)
}

const goToDetail = (code: string) => {
  router.push(`/stocks/${code}`)
}

onMounted(() => {
  loadStocks()
})
</script>

<style lang="scss" scoped>
.stocks-view {
  .el-table {
    cursor: pointer;
  }
}
</style>