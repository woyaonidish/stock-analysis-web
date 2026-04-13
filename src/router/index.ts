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
    path: '/etf',
    name: 'ETF',
    component: () => import('@/views/ETFView.vue')
  },
  {
    path: '/fund-flow',
    name: 'FundFlow',
    component: () => import('@/views/FundFlowView.vue')
  },
  {
    path: '/indicators',
    name: 'Indicators',
    component: () => import('@/views/IndicatorsView.vue')
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