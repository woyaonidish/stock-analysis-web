import axios from 'axios'
import type { ApiResponse, Stock, StockHist, StockMinData, ETF, ETFHist, FundFlowIndividual, FundFlowSector, Indicator, StrategyType, StrategyResult, BacktestResult, BacktestRequest } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
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
  adjust?: string
}): Promise<ApiResponse<StockHist[]>> => {
  return api.get(`/stocks/${code}/hist`, { params })
}

// 获取分时数据
export const getStockMin = (code: string, params?: {
  period?: string
  start_date?: string
  end_date?: string
  adjust?: string
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

// ==================== ETF接口 ====================

// 获取ETF列表
export const getETFList = (tradeDate?: string): Promise<ApiResponse<ETF[]>> => {
  return api.get('/etf/list', { params: { trade_date: tradeDate } })
}

// 获取ETF详情
export const getETFDetail = (code: string, tradeDate?: string): Promise<ApiResponse<ETF>> => {
  return api.get(`/etf/${code}`, { params: { trade_date: tradeDate } })
}

// 获取ETF历史数据
export const getETFHist = (code: string, params?: {
  start_date?: string
  end_date?: string
  period?: string
  adjust?: string
}): Promise<ApiResponse<ETFHist[]>> => {
  return api.get(`/etf/${code}/hist`, { params })
}

// 抓取ETF数据
export const fetchETFData = (tradeDate?: string): Promise<ApiResponse<{ count: number }>> => {
  return api.post('/etf/fetch', null, { params: { trade_date: tradeDate } })
}

// ==================== 资金流向接口 ====================

// 获取个股资金流向
export const getIndividualFundFlow = (indicator?: string): Promise<ApiResponse<FundFlowIndividual[]>> => {
  return api.get('/fund-flow/individual', { params: { indicator } })
}

// 获取板块资金流向
export const getSectorFundFlow = (params?: {
  indicator?: string
  sector_type?: string
}): Promise<ApiResponse<FundFlowSector[]>> => {
  return api.get('/fund-flow/sector', { params })
}

// 抓取资金流向数据
export const fetchFundFlowData = (tradeDate?: string): Promise<ApiResponse<Record<string, number>>> => {
  return api.post('/fund-flow/fetch', null, { params: { trade_date: tradeDate } })
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

export default api