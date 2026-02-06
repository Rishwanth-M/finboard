'use client';

import { useState } from 'react';
import { useDashboardStore, WidgetConfig } from '@/store/dashboardStore';

import AddWidgetModal from '@/components/AddWidgetModal';
import WidgetSettingsModal from '@/components/WidgetSettingsModal';
import SortableWidget from '@/components/SortableWidget';

import { exportDashboard, importDashboard } from '@/utils/exportImport';

import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

export default function Dashboard() {
  const {
    widgets,
    removeWidget,
    updateWidget,
    reorderWidgets,
  } = useDashboardStore();

  const [showAdd, setShowAdd] = useState(false);
  const [settingsWidget, setSettingsWidget] =
    useState<WidgetConfig | null>(null);

  return (
    <div className="relative min-h-screen bg-[#0b1220] text-white px-8 py-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-md">
            📊
          </div>
          <div>
            <h1 className="text-lg font-semibold">Finance Dashboard</h1>
            <p className="text-xs text-gray-400">
              {widgets.length
                ? `${widgets.length} active widget${widgets.length > 1 ? 's' : ''} · Real-time data`
                : 'Connect to APIs and build your custom dashboard'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-md text-sm font-medium"
          >
            + Add Widget
          </button>

          <button
            onClick={() => {
              try {
                navigator.clipboard.writeText(
                  exportDashboard(widgets)
                );
              } catch {
                alert('Failed to copy dashboard config');
              }
            }}
            className="bg-white/10 px-3 py-2 rounded-md text-sm"
          >
            Export
          </button>

          <button
            onClick={() => {
              const json = prompt('Paste dashboard JSON');
              if (!json) return;

              try {
                const widgets = importDashboard(json);
                useDashboardStore.setState({ widgets });
              } catch {
                alert('Invalid dashboard configuration');
              }
            }}
            className="bg-white/10 px-3 py-2 rounded-md text-sm"
          >
            Import
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {widgets.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="mb-4 text-4xl">📊</div>
          <h2 className="text-xl font-semibold mb-2">
            Build Your Finance Dashboard
          </h2>
          <p className="text-sm text-gray-400 max-w-md">
            Create custom widgets by connecting to any finance API.
          </p>
        </div>
      )}

      {/* GRID */}
      {widgets.length > 0 && (
        <>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (over && active.id !== over.id) {
                reorderWidgets(active.id as string, over.id as string);
              }
            }}
          >
            <SortableContext
              items={widgets.map((w) => w.id)}
              strategy={rectSortingStrategy}
            >
              <div className="max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {widgets.map((widget) => (
                  <SortableWidget
                    key={widget.id}
                    widget={widget}
                    onRemove={() => removeWidget(widget.id)}
                    onSettings={() => setSettingsWidget(widget)}
                    onRefresh={() =>
                      updateWidget(widget.id, {
                        refreshNonce: Date.now(),
                      })
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* ADD TILE */}
          <div
            onClick={() => setShowAdd(true)}
            className="mt-6 w-[320px] cursor-pointer border border-dashed border-white/20 rounded-xl
                       flex flex-col items-center justify-center text-center p-6
                       hover:border-emerald-500 transition"
          >
            <div className="text-3xl mb-2">＋</div>
            <p className="text-sm font-medium">Add Widget</p>
            <p className="text-xs text-gray-400 mt-1">
              Connect to a finance API
            </p>
          </div>
        </>
      )}

      {/* MODALS */}
      {showAdd && <AddWidgetModal onClose={() => setShowAdd(false)} />}
      {settingsWidget && (
        <WidgetSettingsModal
          widget={settingsWidget}
          onClose={() => setSettingsWidget(null)}
        />
      )}
    </div>
  );
}
