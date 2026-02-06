'use client';

import { useState } from 'react';
import { WidgetConfig, useDashboardStore } from '@/store/dashboardStore';

export default function WidgetSettingsModal({
  widget,
  onClose,
}: {
  widget: WidgetConfig;
  onClose: () => void;
}) {
  const updateWidget = useDashboardStore((s) => s.updateWidget);

  const [title, setTitle] = useState(widget.title);
  const [interval, setInterval] = useState(widget.refreshInterval);
  const [apiUrl, setApiUrl] = useState(widget.apiUrl);

  function save() {
    if (!title || !apiUrl || interval < 5) {
      alert('Please enter valid values');
      return;
    }

    updateWidget(widget.id, {
      title,
      refreshInterval: interval,
      apiUrl,
      refreshNonce: Date.now(), // force re-fetch
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#111827] p-6 rounded-lg w-[400px]">

        <h3 className="font-semibold mb-4">Widget Settings</h3>

        <label className="text-xs">Title</label>
        <input
          className="w-full bg-[#0b1220] p-2 rounded mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="text-xs">API URL</label>
        <input
          className="w-full bg-[#0b1220] p-2 rounded mb-3"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
        />

        <label className="text-xs">Refresh Interval (seconds)</label>
        <input
          type="number"
          min={5}
          className="w-full bg-[#0b1220] p-2 rounded mb-4"
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-400">
            Cancel
          </button>
          <button
            onClick={save}
            className="bg-emerald-500 px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
