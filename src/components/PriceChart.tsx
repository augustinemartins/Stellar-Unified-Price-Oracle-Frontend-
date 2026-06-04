import { memo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { PriceHistoryEntry } from '../types'
import { formatChartTime, formatPriceShort } from '../utils/format'

interface PriceChartProps {
  data: PriceHistoryEntry[]
  pair: string
  loading?: boolean
}

export const PriceChart = memo(function PriceChart({ data, pair, loading }: PriceChartProps) {
  if (loading) {
    return (
      <div className="h-80 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-center" role="status" aria-label="Loading chart">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="h-80 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-center text-gray-500">
        No historical data available
      </div>
    )
  }

  const chartData = data
    .slice()
    .reverse()
    .map((d) => ({ ...d, time: formatChartTime(d.timestamp) }))

  const prices = chartData.map((d) => d.price)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const pad = (maxP - minP) * 0.1 || maxP * 0.05

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{pair} Price History</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={{ stroke: '#1f2937' }}
              tickLine={false}
            />
            <YAxis
              domain={[minP - pad, maxP + pad]}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatPriceShort}
              width={80}
            />
            <Tooltip
              contentStyle={{
                background: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '8px',
                fontSize: '13px',
              }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value: number) => [`$${formatPriceShort(value)}`, pair]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#22d3ee' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
})
