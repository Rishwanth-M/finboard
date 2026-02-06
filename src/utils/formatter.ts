export function formatValue(
  value: any,
  type?: 'currency' | 'percentage' | 'number'
) {
  if (value == null || value === '') return '—';

  const num = Number(value);
  if (isNaN(num)) return String(value);

  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(num);

    case 'percentage':
      return `${num.toFixed(2)}%`;

    case 'number':
    default:
      return new Intl.NumberFormat('en-IN').format(num);
  }
}
