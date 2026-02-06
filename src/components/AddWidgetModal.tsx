'use client';

import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { fetchApi } from '@/services/apiService';
import { useDashboardStore } from '@/store/dashboardStore';

export type FlatField = {
  path: string;
  type: string;
  sample: string;
};

export default function AddWidgetModal({ onClose }: { onClose: () => void }) {
  const addWidget = useDashboardStore((s) => s.addWidget);

  const [title, setTitle] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [interval, setInterval] = useState(30);

  const [widgetType, setWidgetType] =
    useState<'card' | 'table' | 'chart'>('card');

  const [fields, setFields] = useState<FlatField[]>([]);
  const [selected, setSelected] = useState<FlatField[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiTested, setApiTested] = useState(false);

  /* ---------- SMART FIELD FLATTENER (ALPHA VANTAGE SAFE) ---------- */
  function flatten(obj: any, result: FlatField[] = []) {
    if (!obj || typeof obj !== 'object') return result;

    // If array → extract fields from FIRST object only
    if (Array.isArray(obj)) {
      if (obj.length && typeof obj[0] === 'object') {
        flatten(obj[0], result);
      }
      return result;
    }

    for (const key in obj) {
      const value = obj[key];

      if (Array.isArray(value)) {
        // 👇 KEY FIX: ignore array name, flatten its object items
        flatten(value, result);
      } else if (typeof value === 'object' && value !== null) {
        flatten(value, result);
      } else {
        result.push({
          path: key,
          type: typeof value,
          sample: String(value),
        });
      }
    }

    return result;
  }

  /* ---------------- API TEST ---------------- */
  async function handleTest() {
    if (!apiUrl) return;

    try {
      setLoading(true);
      const data = await fetchApi(apiUrl);
      const flat = flatten(data);

      setFields(flat);
      setSelected([]);
      setApiTested(true);
    } catch {
      alert('API test failed');
      setApiTested(false);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- ADD WIDGET ---------------- */
  function handleAdd() {
    if (!title || !apiUrl || !selected.length) {
      alert('Fill all required fields');
      return;
    }

    addWidget({
      id: uuid(),
      title,
      apiUrl,
      refreshInterval: interval,
      widgetType,
      selectedFields: selected,
      refreshNonce: Date.now(),
    });

    onClose();
  }

  const filtered = fields.filter((f) =>
    f.path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111827] w-[520px] rounded-lg p-6">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add New Widget</h2>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        <label className="text-xs">Widget Name</label>
        <input
          className="w-full bg-[#0b1220] p-2 rounded mt-1 mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="text-xs">API URL</label>
        <div className="flex gap-2 mt-1 mb-3">
          <input
            className="flex-1 bg-[#0b1220] p-2 rounded"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
          <button
            onClick={handleTest}
            className="bg-emerald-500 px-3 rounded text-sm"
          >
            {loading ? 'Testing…' : 'Test'}
          </button>
        </div>

        <label className="text-xs">Refresh Interval (seconds)</label>
        <input
          type="number"
          min={5}
          className="w-full bg-[#0b1220] p-2 rounded mt-1"
          value={interval}
          onChange={(e) => setInterval(+e.target.value)}
        />

        {apiTested && (
          <>
            <label className="text-xs mt-4 block">Widget Type</label>
            <div className="flex gap-2 mt-1">
              {(['card', 'table', 'chart'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setWidgetType(t)}
                  className={`px-3 py-1 text-xs rounded ${
                    widgetType === t ? 'bg-emerald-500' : 'bg-[#0b1220]'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            <label className="text-xs mt-4 block">Search Fields</label>
            <input
              className="w-full bg-[#0b1220] p-2 rounded mt-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="mt-4 max-h-32 overflow-y-auto bg-[#0b1220] rounded p-2 space-y-1">
              {filtered.map((f) => (
                <div
                  key={f.path}
                  className="flex justify-between items-center text-xs p-2 hover:bg-white/5 rounded"
                >
                  <div>
                    <div>{f.path}</div>
                    <div className="text-[10px] text-gray-500">
                      {f.type} | {f.sample}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      !selected.find((s) => s.path === f.path) &&
                      setSelected([...selected, f])
                    }
                    className="text-emerald-400"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-gray-400 text-sm">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-emerald-500 px-4 py-2 rounded text-sm"
          >
            Add Widget
          </button>
        </div>
      </div>
    </div>
  );
}
