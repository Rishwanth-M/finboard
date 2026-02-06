import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ================= TYPES ================= */

export type WidgetType = 'card' | 'table' | 'chart';

export type FieldMeta = {
  path: string;
  type: string;
  sample: string;
};

export interface WidgetConfig {
  id: string;
  title: string;
  apiUrl: string;
  refreshInterval: number;
  widgetType: WidgetType;
  selectedFields: FieldMeta[];
  refreshNonce: number;
}

/* ================= STATE ================= */

interface DashboardState {
  widgets: WidgetConfig[];

  addWidget: (w: WidgetConfig) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  reorderWidgets: (fromId: string, toId: string) => void;

  exportConfig: () => string;
  importConfig: (json: string) => void;
}

/* ================= STORE ================= */

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: [],

      addWidget: (w) =>
        set((s) => ({ widgets: [...s.widgets, w] })),

      removeWidget: (id) =>
        set((s) => ({
          widgets: s.widgets.filter((w) => w.id !== id),
        })),

      updateWidget: (id, updates) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),

      reorderWidgets: (fromId, toId) =>
        set((s) => {
          const list = [...s.widgets];
          const fromIndex = list.findIndex((w) => w.id === fromId);
          const toIndex = list.findIndex((w) => w.id === toId);
          if (fromIndex === -1 || toIndex === -1) return s;

          const [moved] = list.splice(fromIndex, 1);
          list.splice(toIndex, 0, moved);
          return { widgets: list };
        }),

      exportConfig: () =>
        JSON.stringify(get().widgets, null, 2),

      importConfig: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (!Array.isArray(parsed)) return;
          set({ widgets: parsed });
        } catch {
          console.error('Invalid dashboard config');
        }
      },
    }),
    {
      name: 'dashboard-storage',
      version: 1,
    }
  )
);
