import { Domain, Keyword } from '@/modules/rank-tracker-old/types';

// Generic sorting function for numbers and strings
export const sortByField = <T>(
  a: T,
  b: T,
  field: keyof T,
  desc: boolean = false,
) => {
  const aValue = a[field];
  const bValue = b[field];

  // Handle undefined/null values
  if (!aValue && aValue !== 0) return desc ? -1 : 1;
  if (!bValue && bValue !== 0) return desc ? 1 : -1;

  // Sort numbers
  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return desc ? bValue - aValue : aValue - bValue;
  }

  // Sort strings
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return desc
      ? bValue.localeCompare(aValue, 'da')
      : aValue.localeCompare(bValue, 'da');
  }

  return 0;
};

// Domain-specific sorting
export const sortDomains = (
  a: Domain,
  b: Domain,
  field: keyof Domain,
  desc: boolean = false,
) => {
  return sortByField(a, b, field, desc);
};

// Keyword-specific sorting with special handling for metrics
export const sortKeywords = (
  a: Keyword,
  b: Keyword,
  field: keyof Keyword,
  desc: boolean = false,
) => {
  // Special handling for metrics that should be treated as numbers
  const numericFields = ['ranking', 'clicks', 'impressions', 'search_volume'];

  if (numericFields.includes(field as string)) {
    const aValue = Number(a[field]) || 0;
    const bValue = Number(b[field]) || 0;
    return desc ? bValue - aValue : aValue - bValue;
  }

  return sortByField(a, b, field, desc);
};

// Helper function to determine if a field should be sorted as number
export const isNumericField = (field: string): boolean => {
  const numericFields = [
    'keywords_count',
    'avg_position',
    'clicks',
    'impressions',
    'top_3_keywords',
    'ranking',
    'search_volume',
  ];
  return numericFields.includes(field);
};
