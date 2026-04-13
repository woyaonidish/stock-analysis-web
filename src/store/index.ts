import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Stock, ETF, StrategyType, Indicator } from '@/types'

export const useStockStore = defineStore('stock', () => {
  const stocks = ref<Stock[]>([])
  const currentStock = ref<Stock | null>(null)
  const loading = ref(false)

  const setStocks = (data: Stock[]) => {
    stocks.value = data
  }

  const setCurrentStock = (stock: Stock | null) => {
    currentStock.value = stock
  }

  const setLoading = (val: boolean) => {
    loading.value = val
  }

  return {
    stocks,
    currentStock,
    loading,
    setStocks,
    setCurrentStock,
    setLoading
  }
})

export const useETFStore = defineStore('etf', () => {
  const etfs = ref<ETF[]>([])
  const loading = ref(false)

  const setETFs = (data: ETF[]) => {
    etfs.value = data
  }

  const setLoading = (val: boolean) => {
    loading.value = val
  }

  return {
    etfs,
    loading,
    setETFs,
    setLoading
  }
})

export const useStrategyStore = defineStore('strategy', () => {
  const strategyTypes = ref<StrategyType[]>([])
  const currentStrategy = ref<string>('volume_up')

  const setStrategyTypes = (types: StrategyType[]) => {
    strategyTypes.value = types
  }

  const setCurrentStrategy = (type: string) => {
    currentStrategy.value = type
  }

  return {
    strategyTypes,
    currentStrategy,
    setStrategyTypes,
    setCurrentStrategy
  }
})

export const useIndicatorStore = defineStore('indicator', () => {
  const indicators = ref<Indicator[]>([])
  const loading = ref(false)

  const setIndicators = (data: Indicator[]) => {
    indicators.value = data
  }

  const setLoading = (val: boolean) => {
    loading.value = val
  }

  return {
    indicators,
    loading,
    setIndicators,
    setLoading
  }
})