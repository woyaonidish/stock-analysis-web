import axios from 'axios'
import type { ApiResponse, Stock, StockHist, StockMinData, CachedHist, Index, Financial, Pattern, PatternSignal, Indicator, StrategyType, StrategyResult, BacktestResult, BacktestRequest, AttentionStock, CacheStatus } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
api.interceptors.response.use(
  (response: any) => response.data,
  (error: any) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// ==================== 股票接口 ====================

// 获取股票列表
export const getStockList = (tradeDate?: string): Promise<ApiResponse<Stock[]>> => {
  return api.get('/stocks/list', { params: { trade_date: tradeDate } })
}

// 获取股票详情
export const getStockDetail = (code: string, tradeDate?: string): Promise<ApiResponse<Stock>> => {
  return api.get(`/stocks/${code}`, { params: { trade_date: tradeDate } })
}

// 获取股票历史数据
export const getStockHist = (code: string, params?: {
  start_date?: string
  end_date?: string
  period?: string
}): Promise<ApiResponse<StockHist[]>> => {
  return api.get(`/stocks/${code}/hist`, { params })
}

// 获取分时数据
export const getStockMin = (code: string, params?: {
  period?: string
}): Promise<ApiResponse<StockMinData[]>> => {
  return api.get(`/stocks/${code}/min`, { params })
}

// 搜索股票
export const searchStock = (keyword: string, tradeDate?: string): Promise<ApiResponse<Stock[]>> => {
  return api.get(`/stocks/search/${keyword}`, { params: { trade_date: tradeDate } })
}

// 抓取每日数据
export const fetchDailyData = (tradeDate?: string): Promise<ApiResponse<{ count: number }>> => {
  return api.post('/stocks/fetch', null, { params: { trade_date: tradeDate } })
}

// ==================== 指数接口 ====================

// 获取指数列表
export const getIndexList = (tradeDate?: string): Promise<ApiResponse<Index[]>> => {
  return api.get('/index/list', { params: { trade_date: tradeDate } })
}

// 获取指数详情
export const getIndexDetail = (code: string, tradeDate?: string): Promise<ApiResponse<Index>> => {
  return api.get(`/index/${code}`, { params: { trade_date: tradeDate } })
}

// 抓取指数数据
export const fetchIndexData = (tradeDate?: string): Promise<ApiResponse<{ count: number }>> => {
  return api.post('/index/fetch', null, { params: { trade_date: tradeDate } })
}

// ==================== 财务数据接口 ====================

// 获取股票财务数据
export const getFinancial = (code: string, reportDate?: string): Promise<ApiResponse<Financial>> => {
  return api.get(`/financial/${code}`, { params: { report_date: reportDate } })
}

// 获取历史财务数据
export const getFinancialHistory = (code: string, limit?: number): Promise<ApiResponse<Financial[]>> => {
  return api.get(`/financial/${code}/history`, { params: { limit } })
}

// 获取最新报告期
export const getLatestReportDate = (): Promise<ApiResponse<{ report_date: string }>> => {
  return api.get('/financial/latest-report-date')
}

// ==================== 技术指标接口 ====================

// 获取股票指标
export const getStockIndicator = (code: string, tradeDate?: string): Promise<ApiResponse<Indicator>> => {
  return api.get(`/indicators/${code}`, { params: { trade_date: tradeDate } })
}

// 获取所有股票指标
export const getAllIndicators = (tradeDate?: string): Promise<ApiResponse<Indicator[]>> => {
  return api.get('/indicators/list', { params: { trade_date: tradeDate } })
}

// 获取买入信号
export const getBuySignals = (tradeDate?: string): Promise<ApiResponse<{ code: string; date: string }[]>> => {
  return api.get('/indicators/signals/buy', { params: { trade_date: tradeDate } })
}

// 获取卖出信号
export const getSellSignals = (tradeDate?: string): Promise<ApiResponse<{ code: string; date: string }[]>> => {
  return api.get('/indicators/signals/sell', { params: { trade_date: tradeDate } })
}

// 计算并保存指标
export const calculateIndicator = (code: string, tradeDate?: string): Promise<ApiResponse<{ code: string }>> => {
  return api.post(`/indicators/calculate/${code}`, null, { params: { trade_date: tradeDate } })
}

// ==================== K线形态接口 ====================

// 获取股票形态
export const getPattern = (code: string, tradeDate?: string): Promise<ApiResponse<Pattern>> => {
  return api.get(`/patterns/${code}`, { params: { trade_date: tradeDate } })
}

// 获取形态列表
export const getPatternList = (tradeDate?: string): Promise<ApiResponse<Pattern[]>> => {
  return api.get('/patterns/list', { params: { trade_date: tradeDate } })
}

// 获取形态买入信号
export const getPatternBuySignals = (tradeDate?: string): Promise<ApiResponse<PatternSignal[]>> => {
  return api.get('/patterns/signals/buy', { params: { trade_date: tradeDate } })
}

// 获取形态卖出信号
export const getPatternSellSignals = (tradeDate?: string): Promise<ApiResponse<PatternSignal[]>> => {
  return api.get('/patterns/signals/sell', { params: { trade_date: tradeDate } })
}

// 计算形态
export const calculatePattern = (code: string, tradeDate?: string): Promise<ApiResponse<{ code: string }>> => {
  return api.post(`/patterns/calculate/${code}`, null, { params: { trade_date: tradeDate } })
}

// 批量计算形态
export const calculateAllPatterns = (tradeDate?: string): Promise<ApiResponse<{ count: number }>> => {
  return api.post('/patterns/calculate-all', null, { params: { trade_date: tradeDate } })
}

// ==================== 策略选股接口 ====================

// 获取策略类型列表
export const getStrategyTypes = (): Promise<ApiResponse<StrategyType[]>> => {
  return api.get('/strategy/types')
}

// 获取策略结果
export const getStrategyResult = (strategyType: string, tradeDate?: string): Promise<ApiResponse<StrategyResult[]>> => {
  return api.get(`/strategy/${strategyType}`, { params: { trade_date: tradeDate } })
}

// 运行策略
export const runStrategy = (params: { strategy_type: string; trade_date?: string }): Promise<ApiResponse<{ strategy_type: string; trade_date: string; count: number }>> => {
  return api.post('/strategy/run', params)
}

// 运行所有策略
export const runAllStrategies = (tradeDate?: string): Promise<ApiResponse<Record<string, number>>> => {
  return api.post('/strategy/run-all', null, { params: { trade_date: tradeDate } })
}

// ==================== 回测接口 ====================

// 运行回测
export const runBacktest = (params: BacktestRequest): Promise<ApiResponse<BacktestResult>> => {
  return api.post('/backtest/run', params)
}

// 运行所有策略回测
export const runAllBacktests = (params: { start_date: string; end_date: string }): Promise<ApiResponse<Record<string, BacktestResult>>> => {
  return api.post('/backtest/run-all', null, { params })
}

// ==================== 关注股票接口 ====================

// 获取关注股票列表
export const getAttentionList = (tradeDate?: string): Promise<ApiResponse<AttentionStock[]>> => {
  return api.get('/attention/list', { params: { trade_date: tradeDate } })
}

// 获取关注股票代码
export const getAttentionCodes = (): Promise<ApiResponse<string[]>> => {
  return api.get('/attention/codes')
}

// 检查是否关注
export const checkAttention = (code: string): Promise<ApiResponse<{ code: string; is_attention: boolean }>> => {
  return api.get(`/attention/check/${code}`)
}

// 添加关注
export const addAttention = (code: string): Promise<ApiResponse<{ code: string }>> => {
  return api.post(`/attention/add/${code}`)
}

// 取消关注
export const removeAttention = (code: string): Promise<ApiResponse<{ code: string }>> => {
  return api.delete(`/attention/remove/${code}`)
}

// 清空关注列表
export const clearAttention = (): Promise<ApiResponse<{ count: number }>> => {
  return api.delete('/attention/clear')
}

// ==================== 历史数据缓存接口 ====================

// 获取缓存历史数据
export const getCachedHist = (code: string, params?: {
  start_date?: string
  end_date?: string
}): Promise<ApiResponse<CachedHist[]>> => {
  return api.get(`/hist/cache/${code}`, { params })
}

// 获取缓存状态
export const getCacheStatus = (code: string): Promise<ApiResponse<CacheStatus>> => {
  return api.get(`/hist/status/${code}`)
}

// 获取并缓存历史数据
export const fetchAndCacheHist = (code: string, days?: number): Promise<ApiResponse<{ code: string; count: number }>> => {
  return api.post(`/hist/fetch/${code}`, null, { params: { days } })
}

// 批量获取并缓存历史数据
export const fetchBatchHist = (params?: { days?: number; codes?: string }): Promise<ApiResponse<{ total_count: number; success_count: number; processed: number }>> => {
  return api.post('/hist/fetch-batch', null, { params })
}

// 清除缓存
export const clearHistCache = (code: string): Promise<ApiResponse<{ code: string; count: number }>> => {
  return api.delete(`/hist/clear/${code}`)
}

export default api