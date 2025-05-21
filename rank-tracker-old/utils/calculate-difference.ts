/**
 * Calculates the difference between two values for UI display
 * @param value - Current value
 * @param compareValue - Previous/comparison value
 * @returns The percentage difference between values (positive is improvement)
 */
export function calculateDifference(
  value: number | string | undefined,
  compareValue: number | string | undefined,
): number {
  // Handle invalid values
  if (!value || !compareValue) return 0;

  // Clean the values by removing any '>' symbols that might be in string positions
  const current = Number(String(value).replaceAll('>', ''));
  const previous = Number(String(compareValue).replaceAll('>', ''));

  // Handle edge cases
  if (isNaN(current) || isNaN(previous)) return 0;
  if (previous === 0) return 0;

  // Calculate the percentage difference
  return ((current - previous) / previous) * 100;
}

/**
 * Format value for display, handling different types (percentages, numbers, etc.)
 * @param value Value to format
 * @param format Format type (number, percentage, position, currency)
 * @returns Formatted string value
 */
export function formatValue(
  value: number | string | undefined | null,
  format: 'number' | 'percentage' | 'position' | 'currency' = 'number',
): string {
  if (value === undefined || value === null) return '0';
  if (typeof value === 'string') return value;

  try {
    switch (format) {
      case 'percentage':
        return `${value.toLocaleString('da-DK', { maximumFractionDigits: 2 })}%`;
      case 'position':
        return value.toLocaleString('da-DK', { maximumFractionDigits: 1 });
      case 'currency':
        return value.toLocaleString('da-DK', { maximumFractionDigits: 2 });
      default:
        return value.toLocaleString('da-DK');
    }
  } catch (error) {
    console.error('Error formatting value:', error);
    return '0';
  }
}

/**
 * Safely access a nested property in an object without causing errors
 * @param obj Object to get property from
 * @param path Path to property (e.g., "a.b.c")
 * @param defaultValue Default value if property doesn't exist
 * @returns The property value or default
 */
export function safeGet<T>(
  obj: Record<string, any> | undefined | null,
  path: string,
  defaultValue: T,
): T {
  if (!obj) return defaultValue;

  const keys = path.split('.');
  let result: any = obj;

  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined || result === null ? defaultValue : result;
}
