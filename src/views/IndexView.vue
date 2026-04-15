<template>
  <div class="index-view">
    <div class="page-card">
      <div class="page-title">
        <el-icon><Promotion /></el-icon>
        指数行情
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
        <el-button type="primary" @click="loadIndexList">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button type="warning" @click="handleFetchData">
          <el-icon><Download /></el-icon>
          抓取数据
        </el-button>
      </div>

      <!-- 指数列表 -->
      <el-table :data="indexList" v-loading="loading" stripe>
        <el-table-column prop="code" label="代码" width="100" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="close_price" label="最新价" width="120">
          <template #default="{ row }">
            <span :class="getChangeClass(row.change_rate)">
              {{ row.close_price.toFixed(2) }}
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
        <el-table-column prop="open_price" label="开盘" width="120">
          <template #default="{ row }">{{ row.open_price.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="high_price" label="最高" width="120">
          <template #default="{ row }">{{ row.high_price.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="low_price" label="最低" width="120">
          <template #default="{ row }">{{ row.low_price.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="pre_close" label="昨收" width="120">
          <template #default="{ row }">{{ row.pre_close.toFixed(2) }}</template>
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getIndexList, fetchIndexData } from '@/api'
import type { Index } from '@/types'

const indexList = ref<Index[]>([])
const loading = ref(false)
const tradeDate = ref<string>('')

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

const loadIndexList = async () => {
  loading.value = true
  try {
    const res = await getIndexList(tradeDate.value)
    if (res.code === 0) {
      indexList.value = res.data
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载指数数据失败')
  } finally {
    loading.value = false
  }
}

const handleFetchData = async () => {
  loading.value = true
  try {
    const res = await fetchIndexData(tradeDate.value)
    if (res.code === 0) {
      ElMessage.success(`成功抓取 ${res.data.count} 条数据`)
      loadIndexList()
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
  loadIndexList()
})
</script>

<style lang="scss" scoped>
.index-view {
  height: 100%;
}
</style>