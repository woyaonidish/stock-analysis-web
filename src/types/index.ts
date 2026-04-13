// 通用响应格式
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 股票数据
export interface Stock {
  code: string
  name: string
  new_price: number
  change_rate: number
  change_amount?: number
  volume: number
  amount: number
  open_price?: number
  high_price?: number
  low_price?: number
  pre_close_price?: number
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
  amplitude?: number
  change_pct?: number
  change_amount?: number
  turnover?: number
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

// ETF数据
export interface ETF {
  code: string
  name: string
  new_price: number
  change_rate: number
  change_amount?: number
  volume: number
  amount: number
  date?: string
}

// ETF历史数据
export interface ETFHist {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
  amount: number
}

// 资金流向 - 个股
export interface FundFlowIndividual {
  代码: string
  名称: string
  最新价: number
  今日涨跌幅: number
  今日主力净流入_净额?: number
  今日主力净流入_净占比?: number
  今日超大单净流入_净额?: number
  今日大单净流入_净额?: number
}

// 资金流向 - 板块
export interface FundFlowSector {
  名称: string
  今日涨跌幅: number
  今日主力净流入_净额?: number
  今日主力净流入_净占比?: number
  今日主力净流入最大股?: string
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
  rsi_6?: number
  rsi_12?: number
  rsi_24?: number
  atr?: number
  cci?: number
  wr_6?: number
  wr_10?: number
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