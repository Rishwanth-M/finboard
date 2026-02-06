'use client';

import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { fetchApi } from '@/services/apiService';
import { flattenJson, FlatField } from '@/utils/jsonFlattener';
import { useDashboardStore } from '@/store/dashboardStore';

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
  const [showArraysOnly, setShowArraysOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiTested, setApiTested] = useState(false);

  /* ------------------ API TEST ------------------ */
  async function handleTest() {
    if (!apiUrl) return;

    try {
      setLoading(true);
      const data = await fetchApi(apiUrl);
      setFields(flattenJson(data));
      setSelected([]);
      setApiTested(true);
    } catch {
      alert('API test failed');
      setApiTested(false);
    } finally {
      setLoading(false);
    }
  }

  /* ------------------ ADD WIDGET ------------------ */
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

  /* ------------------ FILTER ------------------ */
  const filteredFields = fields.filter((f) => {
    if (showArraysOnly && f.type !== 'array') return false;
    return f.path.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111827] w-[520px] rounded-lg p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add New Widget</h2>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        {/* BASIC INPUTS */}
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
          onChange={(e) => setInterval(Number(e.target.value))}
        />

        {/* AFTER API TEST */}
        {apiTested && (
          <>
            <label className="text-xs mt-4 block">Widget Type</label>
            <div className="flex gap-2 mt-1">
              {(['card', 'table', 'chart'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setWidgetType(mode)}
                  className={`px-3 py-1 text-xs rounded ${
                    widgetType === mode ? 'bg-emerald-500' : 'bg-[#0b1220]'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>

            <label className="text-xs mt-4 block">Search Fields</label>
            <input
              className="w-full bg-[#0b1220] p-2 rounded mt-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={showArraysOnly}
                onChange={(e) => setShowArraysOnly(e.target.checked)}
              />
              Show arrays only
            </div>

            {/* AVAILABLE FIELDS */}
            <div className="mt-4">
              <div className="max-h-32 overflow-y-auto bg-[#0b1220] rounded p-2 space-y-1">
                {filteredFields.map((f) => (
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
            </div>

            {/* SELECTED */}
            <div className="mt-3">
              <div className="bg-[#0b1220] rounded p-2 space-y-1">
                {selected.map((f) => (
                  <div
                    key={f.path}
                    className="flex justify-between items-center text-xs"
                  >
                    <span>{f.path}</span>
                    <button
                      onClick={() =>
                        setSelected(
                          selected.filter((x) => x.path !== f.path)
                        )
                      }
                      className="text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ACTIONS */}
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
