'use client';

import { useEffect, useState } from 'react';
import { WidgetConfig } from '@/store/dashboardStore';
import { fetchApi } from '@/services/apiService';
import { getValueByPath } from '@/utils/getValueByPath';
import { formatValue } from '@/utils/formatter';

export default function CardWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('--');
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      const resData = await fetchApi(widget.apiUrl, {
        cacheKey: widget.id,
        ttl: widget.refreshInterval * 1000,
      });

      if (resData?.Information || resData?.Note) {
        setError('API rate limit reached');
        return;
      }

      setError(null);
      setData(resData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, widget.refreshInterval * 1000);
    return () => clearInterval(id);
  }, [widget.apiUrl, widget.refreshInterval, widget.refreshNonce]);

  return (
    <div className="text-sm">

      {/* BODY */}
      {loading && (
        <div className="text-xs text-gray-400">Loading data…</div>
      )}

      {!loading && error && (
        <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-2">
          {widget.selectedFields.map((field: any) => {
            const path = field.path ?? field;
            const raw = getValueByPath(data, path);

            return (
              <div
                key={path}
                className="flex justify-between items-center"
              >
                <span className="text-gray-400">
                  {path.split('.').slice(-1)[0]}
                </span>
                <span className="font-medium text-right">
                  {formatValue(raw)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-white/10 my-3" />

      {/* FOOTER */}
      <div className="text-[10px] text-gray-500">
        Last updated: {lastUpdated}
      </div>
    </div>
  );
}
