'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetConfig } from '@/store/dashboardStore';

import CardWidget from './widgets/CardWidget';
import TableWidget from './widgets/TableWidget';
import ChartWidget from './widgets/ChartWidget';

export default function SortableWidget({
  widget,
  onRemove,
  onSettings,
  onRefresh,
}: {
  widget: WidgetConfig;
  onRemove: () => void;
  onSettings: () => void;
  onRefresh: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  const renderWidget = () => {
    switch (widget.widgetType) {
      case 'card':
        return <CardWidget widget={widget} />;
      case 'table':
        return <TableWidget widget={widget} />;
      case 'chart':
        return <ChartWidget widget={widget} />;
      default:
        return (
          <div className="text-sm text-red-400">
            Unsupported widget type
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#111827]/80 backdrop-blur
                 border border-white/10 rounded-xl p-4
                 shadow-lg shadow-black/40
                 hover:shadow-emerald-500/10 transition"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3 select-none">
        {/* DRAG HANDLE */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
        >
          <span className="text-gray-400 text-sm">⋮⋮</span>
          <h3 className="text-sm font-semibold">{widget.title}</h3>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded">
            {widget.refreshInterval}s
          </span>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <button
            title="Refresh"
            onClick={onRefresh}
            className="hover:text-emerald-400"
          >
            ⟳
          </button>

          <button
            title="Settings"
            onClick={onSettings}
            className="hover:text-emerald-400"
          >
            ⚙
          </button>

          <button
            title="Delete"
            onClick={onRemove}
            className="hover:text-red-400"
          >
            🗑
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {renderWidget()}
    </div>
  );
}
