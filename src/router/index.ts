import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/stocks'
  },
  {
    path: '/stocks',
    name: 'Stocks',
    component: () => import('@/views/StocksView.vue')
  },
  {
    path: '/stocks/:code',
    name: 'StockDetail',
    component: () => import('@/views/StockDetailView.vue')
  },
  {
    path: '/attention',
    name: 'Attention',
    component: () => import('@/views/AttentionView.vue')
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import('@/views/IndexView.vue')
  },
  {
    path: '/financial',
    name: 'Financial',
    component: () => import('@/views/FinancialView.vue')
  },
  {
    path: '/indicators',
    name: 'Indicators',
    component: () => import('@/views/IndicatorsView.vue')
  },
  {
    path: '/patterns',
    name: 'Patterns',
    component: () => import('@/views/PatternsView.vue')
  },
  {
    path: '/strategy',
    name: 'Strategy',
    component: () => import('@/views/StrategyView.vue')
  },
  {
    path: '/backtest',
    name: 'Backtest',
    component: () => import('@/views/BacktestView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router