<template>
  <div class="app-container">
    <el-container>
      <el-aside width="220px" class="sidebar">
        <div class="logo">
          <el-icon><TrendCharts /></el-icon>
          <span>InStock</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          class="sidebar-menu"
          background-color="#1d1e1f"
          text-color="#bfcbd9"
          active-text-color="#409eff"
        >
          <el-menu-item index="/stocks">
            <el-icon><DataLine /></el-icon>
            <span>股票数据</span>
          </el-menu-item>
          <el-menu-item index="/index">
            <el-icon><Promotion /></el-icon>
            <span>指数行情</span>
          </el-menu-item>
          <el-menu-item index="/financial">
            <el-icon><Document /></el-icon>
            <span>财务数据</span>
          </el-menu-item>
          <el-menu-item index="/indicators">
            <el-icon><Odometer /></el-icon>
            <span>技术指标</span>
          </el-menu-item>
          <el-menu-item index="/patterns">
            <el-icon><Connection /></el-icon>
            <span>K线形态</span>
          </el-menu-item>
          <el-menu-item index="/strategy">
            <el-icon><Aim /></el-icon>
            <span>策略选股</span>
          </el-menu-item>
          <el-menu-item index="/backtest">
            <el-icon><Timer /></el-icon>
            <span>策略回测</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  width: 100vw;
}

.el-container {
  height: 100%;
}

.sidebar {
  background-color: #1d1e1f;
  height: 100%;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid #3a3b3c;

  .el-icon {
    font-size: 24px;
    margin-right: 8px;
  }
}

.sidebar-menu {
  border: none;
  height: calc(100% - 60px);
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>