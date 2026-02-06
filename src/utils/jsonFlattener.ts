export type FlatField = {
  path: string;
  type: string;
  sample: string;
};

export function flattenJson(
  obj: any,
  parent = '',
  result: FlatField[] = []
): FlatField[] {
  if (obj === null || typeof obj !== 'object') return result;

  Object.entries(obj).forEach(([key, value]) => {
    const path = parent ? `${parent}.${key}` : key;

    if (Array.isArray(value)) {
      if (value.length && typeof value[0] === 'object') {
        flattenJson(value[0], `${path}[0]`, result);
      } else {
        result.push({
          path,
          type: 'array',
          sample: JSON.stringify(value),
        });
      }
      return;
    }

    if (typeof value === 'object') {
      flattenJson(value, path, result);
      return;
    }

    result.push({
      path,
      type: typeof value,
      sample: String(value),
    });
  });

  return result;
}
