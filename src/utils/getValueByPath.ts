export function getValueByPath(obj: any, path: string): any {
  if (!obj || !path) return null;

  // Convert brackets to dot notation: a[0].b → a.0.b
  const normalized = path.replace(/\[(\d+)\]/g, '.$1');
  const keys = normalized.split('.');

  let current: any = obj;

  for (let i = 0; i < keys.length; i++) {
    if (current == null) return null;

    if (current[keys[i]] !== undefined) {
      current = current[keys[i]];
      continue;
    }

    // Fallback for APIs with weird keys (Alpha Vantage)
    const remaining = keys.slice(i).join('.');
    if (current[remaining] !== undefined) {
      return current[remaining];
    }

    return null;
  }

  return current;
}
