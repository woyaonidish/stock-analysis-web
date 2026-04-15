<template>
  <div class="financial-view">
    <div class="page-card">
      <div class="page-title">
        <el-icon><Document /></el-icon>
        财务数据
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="stockCode"
          placeholder="输入股票代码"
          style="width: 150px"
        />
        <el-select v-model="reportDate" placeholder="报告期" clearable style="width: 150px">
          <el-option v-for="d in reportDates" :key="d" :value="d" :label="d" />
        </el-select>
        <el-button type="primary" @click="loadFinancial">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
      </div>

      <!-- 财务数据展示 -->
      <div v-if="financial" class="financial-content">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover">
              <el-statistic title="每股收益(EPS)" :value="financial.eps || 0" :precision="2" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <el-statistic title="每股净资产(BVPS)" :value="financial.bvps || 0" :precision="2" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <el-statistic title="净资产收益率(ROE)" :value="financial.roe || 0" :precision="2">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-statistic>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <el-statistic title="毛利率" :value="financial.gross_profit_margin || 0" :precision="2">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-statistic>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="6">
            <el-card shadow="hover">
              <el-statistic title="净利率" :value="financial.net_profit_margin || 0" :precision="2">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-statistic>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <el-statistic title="营收增长率" :value="financial.revenue_growth || 0" :precision="2">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-statistic>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <el-statistic title="净利润增长率" :value="financial.net_profit_growth || 0" :precision="2">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-statistic>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <el-statistic title="资产负债率" :value="financial.debt_ratio || 0" :precision="2">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-statistic>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="6">
            <el-card shadow="hover">
              <el-statistic title="流动比率" :value="financial.current_ratio || 0" :precision="2" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <el-statistic title="速动比率" :value="financial.quick_ratio || 0" :precision="2" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <el-statistic title="营业收入" :value="formatMoney(financial.revenue)" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <el-statistic title="净利润" :value="formatMoney(financial.net_profit)" />
            </el-card>
          </el-col>
        </el-row>

        <!-- 历史财务数据 -->
        <div style="margin-top: 30px">
          <h3 style="margin-bottom: 15px">历史财务数据</h3>
          <el-table :data="financialHistory" stripe v-loading="loadingHistory">
            <el-table-column prop="report_date" label="报告期" width="120" />
            <el-table-column prop="eps" label="EPS" width="80">
              <template #default="{ row }">{{ row.eps?.toFixed(2) || '--' }}</template>
            </el-table-column>
            <el-table-column prop="roe" label="ROE(%)" width="80">
              <template #default="{ row }">{{ row.roe?.toFixed(2) || '--' }}</template>
            </el-table-column>
            <el-table-column prop="revenue" label="营业收入" width="140">
              <template #default="{ row }">{{ formatMoney(row.revenue) }}</template>
            </el-table-column>
            <el-table-column prop="net_profit" label="净利润" width="140">
              <template #default="{ row }">{{ formatMoney(row.net_profit) }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <el-empty v-else description="请输入股票代码查询财务数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getFinancial, getFinancialHistory, getLatestReportDate } from '@/api'
import type { Financial } from '@/types'

const stockCode = ref<string>('000001')
const reportDate = ref<string>('')
const reportDates = ref<string[]>([])
const financial = ref<Financial | null>(null)
const financialHistory = ref<Financial[]>([])
const loading = ref(false)
const loadingHistory = ref(false)

const formatMoney = (val?: number) => {
  if (!val) return '--'
  if (val >= 100000000) return (val / 100000000).toFixed(2) + '亿'
  if (val >= 10000) return (val / 10000).toFixed(2) + '万'
  return val.toFixed(2)
}

const loadFinancial = async () => {
  if (!stockCode.value) {
    ElMessage.warning('请输入股票代码')
    return
  }
  loading.value = true
  try {
    const res = await getFinancial(stockCode.value, reportDate.value)
    if (res.code === 0) {
      financial.value = res.data
      loadFinancialHistory()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载财务数据失败')
  } finally {
    loading.value = false
  }
}

const loadFinancialHistory = async () => {
  loadingHistory.value = true
  try {
    const res = await getFinancialHistory(stockCode.value, 8)
    if (res.code === 0) {
      financialHistory.value = res.data
      // 提取报告期列表
      reportDates.value = res.data.map(f => f.report_date)
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载历史财务数据失败')
  } finally {
    loadingHistory.value = false
  }
}

onMounted(() => {
  loadFinancial()
})
</script>

<style lang="scss" scoped>
.financial-view {
  height: 100%;
}
</style>