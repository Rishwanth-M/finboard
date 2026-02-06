'use client';

import { useEffect, useState } from 'react';
import { WidgetConfig } from '@/store/dashboardStore';
import { fetchApi } from '@/services/apiService';
import { getValueByPath } from '@/utils/getValueByPath';
import { formatValue } from '@/utils/formatter';

export default function TableWidget({ widget }: { widget: WidgetConfig }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 5;

  async function fetchData() {
    try {
      setLoading(true);

      const resData = await fetchApi(widget.apiUrl, {
        cacheKey: widget.id,
        ttl: widget.refreshInterval * 1000,
      });

      if (resData?.Information || resData?.Note) {
        setError('API rate limit reached');
        setRows([]);
        return;
      }

      // Find first array in response (common finance API pattern)
      const arrayData = Array.isArray(resData)
  ? resData
  : Object.values(resData).find(Array.isArray) ?? [];


      if (!Array.isArray(arrayData)) {
        setError('No table data found');
        setRows([]);
        return;
      }

      setRows(arrayData);
      setError(null);
    } catch {
      setError('Failed to fetch data');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, widget.refreshInterval * 1000);
    return () => clearInterval(id);
  }, [widget.apiUrl, widget.refreshInterval, widget.refreshNonce]);

  const filtered = rows.filter((row) =>
    widget.selectedFields.some((field: any) => {
      const path = field.path ?? field;
      return String(getValueByPath(row, path) ?? '')
        .toLowerCase()
        .includes(search.toLowerCase());
    })
  );

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading)
    return <p className="text-xs text-gray-400">Loading table…</p>;

  if (error)
    return <p className="text-xs text-yellow-400">{error}</p>;

  if (!rows.length)
    return <p className="text-xs text-gray-400">No data available</p>;

  return (
    <div className="text-xs">

      {/* SEARCH */}
      <input
        placeholder="Search…"
        className="w-full bg-[#0b1220] p-2 rounded mb-3"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {widget.selectedFields.map((field: any) => {
                const path = field.path ?? field;
                return (
                  <th
                    key={path}
                    className="text-left text-gray-400 pb-2 border-b border-white/10"
                  >
                    {path.split('.').slice(-1)[0]}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {paginated.map((row, idx) => (
              <tr key={idx} className="border-b border-white/5">
                {widget.selectedFields.map((field: any, i) => {
                  const path = field.path ?? field;
                  const value = getValueByPath(row, path);

                  return (
                    <td key={i} className="py-1">
                      {formatValue(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between mt-2 text-[10px] text-gray-400">
        <span>
          {page} / {Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <button
            onClick={() =>
              setPage((p) =>
                p < Math.ceil(filtered.length / PAGE_SIZE) ? p + 1 : p
              )
            }
            disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
