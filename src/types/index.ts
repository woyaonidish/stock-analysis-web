// 通用响应格式
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 股票数据（含五档买卖盘）
export interface Stock {
  code: string
  name: string
  open_price?: number
  close_price: number
  high_price?: number
  low_price?: number
  pre_close_price?: number
  volume: number
  amount: number
  // 五档买卖盘
  bid1?: number
  bid1_vol?: number
  bid2?: number
  bid2_vol?: number
  bid3?: number
  bid3_vol?: number
  bid4?: number
  bid4_vol?: number
  bid5?: number
  bid5_vol?: number
  ask1?: number
  ask1_vol?: number
  ask2?: number
  ask2_vol?: number
  ask3?: number
  ask3_vol?: number
  ask4?: number
  ask4_vol?: number
  ask5?: number
  ask5_vol?: number
  date?: string
}

// 股票历史数据
export interface StockHist {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
  amount: number
}

// 缓存历史数据（含更多字段）
export interface CachedHist {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
  amount: number
  amplitude?: number    // 振幅
  quote_change?: number  // 涨跌幅
  ups_downs?: number     // 涨跌额
  turnover?: number      // 换手率
}

// 分时数据
export interface StockMinData {
  time: string
  open: number
  close: number
  high: number
  low: number
  volume: number
  amount: number
}

// 指数数据
export interface Index {
  code: string
  name: string
  date: string
  open_price: number
  close_price: number
  high_price: number
  low_price: number
  pre_close: number
  change_rate: number
  volume: number
  amount: number
}

// 财务数据
export interface Financial {
  code: string
  report_date: string
  eps?: number           // 每股收益
  eps_deducted?: number  // 扣非每股收益
  bvps?: number          // 每股净资产
  cfps?: number          // 每股现金流
  roe?: number           // 净资产收益率
  roe_weighted?: number  // 加权净资产收益率
  net_profit_margin?: number     // 净利率
  gross_profit_margin?: number   // 毛利率
  revenue_growth?: number        // 营收增长率
  net_profit_growth?: number     // 净利润增长率
  debt_ratio?: number            // 资产负债率
  current_ratio?: number         // 流动比率
  quick_ratio?: number           // 速动比率
  revenue?: number               // 营业收入
  net_profit?: number            // 净利润
  total_assets?: number          // 总资产
  net_assets?: number            // 净资产
  total_shares?: number          // 总股本
}

// K线形态数据
export interface Pattern {
  code: string
  date: string
  patterns: Record<string, number>  // 形态名称和强度值
}

// 形态信号
export interface PatternSignal {
  code: string
  date: string
  pattern: string
  signal: 'buy' | 'sell'
}

// 技术指标
export interface Indicator {
  code: string
  date: string
  macd?: number
  macds?: number
  macdh?: number
  kdjk?: number
  kdjd?: number
  kdjj?: number
  rsi?: number
  atr?: number
  cci?: number
}

// 策略类型
export interface StrategyType {
  type: string
  name: string
}

// 策略结果
export interface StrategyResult {
  code: string
  date: string
  strategy_type: string
  score: number
}

// 回测结果
export interface BacktestResult {
  strategy_type: string
  total_return: number
  annual_return: number
  max_drawdown: number
  sharpe_ratio: number
  win_rate: number
  total_trades: number
}

// 回测请求参数
export interface BacktestRequest {
  strategy_type: string
  start_date: string
  end_date: string
  initial_capital?: number
}

// 关注股票数据
export interface AttentionStock {
  code: string
  name: string
  date: string
  close_price: number
  change_rate: number
  volume: number
  amount: number
}

// 缓存状态
export interface CacheStatus {
  code: string
  cache_count: number
  latest_date: string
}