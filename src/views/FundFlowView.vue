<template>
  <div class="fund-flow-view">
    <div class="page-card">
      <div class="page-title">
        <el-icon><Money /></el-icon>
        资金流向
      </div>

      <!-- 类型切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="个股资金流" name="individual">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-select v-model="indicator" placeholder="时间周期" style="width: 120px">
              <el-option value="今日" label="今日" />
              <el-option value="3日" label="3日" />
              <el-option value="5日" label="5日" />
              <el-option value="10日" label="10日" />
            </el-select>
            <el-button type="primary" @click="loadIndividualFundFlow">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </div>

          <!-- 个股资金流表格 -->
          <el-table :data="individualData" v-loading="loading" stripe max-height="500">
            <el-table-column prop="代码" label="代码" width="100" />
            <el-table-column prop="名称" label="名称" width="120" />
            <el-table-column prop="最新价" label="最新价" width="90">
              <template #default="{ row }">
                {{ row.最新价?.toFixed(2) || '--' }}
              </template>
            </el-table-column>
            <el-table-column prop="今日涨跌幅" label="涨跌幅(%)" width="100">
              <template #default="{ row }">
                <span :class="getChangeClass(row.今日涨跌幅)">
                  {{ row.今日涨跌幅?.toFixed(2) || '--' }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="今日主力净流入_净额" label="主力净流入" width="140">
              <template #default="{ row }">
                <span :class="getFlowClass(row.今日主力净流入_净额)">
                  {{ formatAmount(row.今日主力净流入_净额) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="今日主力净流入_净占比" label="主力净占比(%)" width="120">
              <template #default="{ row }">
                <span :class="getFlowClass(row.今日主力净流入_净占比)">
                  {{ row.今日主力净流入_净占比?.toFixed(2) || '--' }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="今日超大单净流入_净额" label="超大单净流入" width="140">
              <template #default="{ row }">
                <span :class="getFlowClass(row.今日超大单净流入_净额)">
                  {{ formatAmount(row.今日超大单净流入_净额) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="今日大单净流入_净额" label="大单净流入" width="140">
              <template #default="{ row }">
                <span :class="getFlowClass(row.今日大单净流入_净额)">
                  {{ formatAmount(row.今日大单净流入_净额) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="板块资金流" name="sector">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-select v-model="sectorIndicator" placeholder="时间周期" style="width: 120px">
              <el-option value="今日" label="今日" />
              <el-option value="5日" label="5日" />
              <el-option value="10日" label="10日" />
            </el-select>
            <el-select v-model="sectorType" placeholder="板块类型" style="width: 150px; margin-left: 16px">
              <el-option value="行业资金流" label="行业资金流" />
              <el-option value="概念资金流" label="概念资金流" />
              <el-option value="地域资金流" label="地域资金流" />
            </el-select>
            <el-button type="primary" @click="loadSectorFundFlow" style="margin-left: 16px">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </div>

          <!-- 板块资金流表格 -->
          <el-table :data="sectorData" v-loading="loading" stripe max-height="500">
            <el-table-column prop="名称" label="板块名称" width="150" />
            <el-table-column prop="今日涨跌幅" label="涨跌幅(%)" width="100">
              <template #default="{ row }">
                <span :class="getChangeClass(row.今日涨跌幅)">
                  {{ row.今日涨跌幅?.toFixed(2) || '--' }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="今日主力净流入_净额" label="主力净流入" width="140">
              <template #default="{ row }">
                <span :class="getFlowClass(row.今日主力净流入_净额)">
                  {{ formatAmount(row.今日主力净流入_净额) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="今日主力净流入_净占比" label="主力净占比(%)" width="120">
              <template #default="{ row }">
                <span :class="getFlowClass(row.今日主力净流入_净占比)">
                  {{ row.今日主力净流入_净占比?.toFixed(2) || '--' }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="今日主力净流入最大股" label="净流入最大股" width="150" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getIndividualFundFlow, getSectorFundFlow } from '@/api'
import type { FundFlowIndividual, FundFlowSector } from '@/types'

const activeTab = ref('individual')
const loading = ref(false)
const indicator = ref('5日')
const sectorIndicator = ref('10日')
const sectorType = ref('行业资金流')
const individualData = ref<FundFlowIndividual[]>([])
const sectorData = ref<FundFlowSector[]>([])

const getChangeClass = (rate: number) => {
  if (rate > 0) return 'up'
  if (rate < 0) return 'down'
  return 'flat'
}

const getFlowClass = (val?: number) => {
  if (!val) return 'flat'
  return val > 0 ? 'up' : val < 0 ? 'down' : 'flat'
}

const formatAmount = (val?: number) => {
  if (!val) return '--'
  if (Math.abs(val) >= 100000000) return (val / 100000000).toFixed(2) + '亿'
  if (Math.abs(val) >= 10000) return (val / 10000).toFixed(2) + '万'
  return val.toFixed(2)
}

const loadIndividualFundFlow = async () => {
  loading.value = true
  try {
    const res = await getIndividualFundFlow(indicator.value)
    if (res.code === 0) {
      individualData.value = res.data
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载个股资金流数据失败')
  } finally {
    loading.value = false
  }
}

const loadSectorFundFlow = async () => {
  loading.value = true
  try {
    const res = await getSectorFundFlow({
      indicator: sectorIndicator.value,
      sector_type: sectorType.value
    })
    if (res.code === 0) {
      sectorData.value = res.data
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载板块资金流数据失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab: string) => {
  if (tab === 'individual') {
    loadIndividualFundFlow()
  } else {
    loadSectorFundFlow()
  }
}

onMounted(() => {
  loadIndividualFundFlow()
})
</script>

<style lang="scss" scoped>
.fund-flow-view {
  // 样式
}
</style>