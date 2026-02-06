import { WidgetConfig } from '../store/dashboardStore';

export function exportDashboard(widgets: WidgetConfig[]): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      widgets,
    },
    null,
    2
  );
}

export function importDashboard(json: string): WidgetConfig[] {
  const parsed = JSON.parse(json);

  if (!parsed || !Array.isArray(parsed.widgets)) {
    throw new Error('Invalid dashboard configuration');
  }

  return parsed.widgets;
}
