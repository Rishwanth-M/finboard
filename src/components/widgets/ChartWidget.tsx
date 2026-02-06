'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { WidgetConfig } from '@/store/dashboardStore';
import { fetchApi } from '@/services/apiService';
import { formatValue } from '@/utils/formatter';

type IntervalType = 'daily' | 'weekly' | 'monthly';

export default function ChartWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any[]>([]);
  const [intervalType, setIntervalType] =
    useState<IntervalType>('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      setLoading(true);

      const resData = await fetchApi(widget.apiUrl, {
        cacheKey: `${widget.id}-${intervalType}`,
        ttl: widget.refreshInterval * 1000,
      });

      if (resData?.Information || resData?.Note) {
        setError('API rate limit reached');
        setData([]);
        return;
      }

      const seriesKey = Object.keys(resData).find((k) =>
        k.toLowerCase().includes(
          intervalType === 'daily'
            ? 'daily'
            : intervalType === 'weekly'
            ? 'weekly'
            : 'monthly'
        )
      );

      if (!seriesKey) {
        setError('No time-series data found');
        setData([]);
        return;
      }

      const series = resData[seriesKey];

      const formatted = Object.entries(series)
        .slice(0, 30)
        .reverse()
        .map(([date, values]: any) => ({
          date,
          value: Number(
            values?.['4. close'] ??
              values?.['5. adjusted close'] ??
              Object.values(values ?? {})[0]
          ),
        }))
        .filter((d) => !Number.isNaN(d.value));

      setData(formatted);
      setError(null);
    } catch {
      setError('Failed to load chart data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, widget.refreshInterval * 1000);
    return () => clearInterval(id);
  }, [widget.apiUrl, widget.refreshInterval, widget.refreshNonce, intervalType]);

  return (
    <div className="text-sm">

      {/* INTERVAL SWITCH */}
      <div className="flex justify-end mb-2">
        <div className="flex gap-1 text-xs">
          {(['daily', 'weekly', 'monthly'] as IntervalType[]).map((i) => (
            <button
              key={i}
              onClick={() => setIntervalType(i)}
              className={`px-2 py-0.5 rounded ${
                intervalType === i
                  ? 'bg-emerald-500'
                  : 'bg-white/10'
              }`}
            >
              {i[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="text-xs text-gray-400">Loading chart…</p>
      )}

      {error && (
        <p className="text-xs text-yellow-400">{error}</p>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                formatter={(v) => formatValue(v)}
                contentStyle={{
                  backgroundColor: '#0b1220',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
