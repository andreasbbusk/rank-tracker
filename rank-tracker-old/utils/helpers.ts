export const formatDateForAPI = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
};

// Helper function to create date ranges
export const createDateRanges = (searchParams: {
  range?: string;
  rangeCompare?: string;
}) => {
  const dateRanges = [];
  const { range, rangeCompare } = searchParams;

  // Add main date range
  if (range) {
    const [fromStr, toStr] = range.split('_');
    if (fromStr && toStr) {
      dateRanges.push({
        start_date: formatDateForAPI(Number(fromStr)),
        end_date: formatDateForAPI(Number(toStr)),
      });
    }
  } else {
    // Default to last 30 days if no range specified
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    dateRanges.push({
      start_date: formatDateForAPI(thirtyDaysAgo.getTime()),
      end_date: formatDateForAPI(today.getTime()),
    });
  }

  // Add compare date range if it exists
  if (rangeCompare) {
    const [fromStr, toStr] = rangeCompare.split('_');
    if (fromStr && toStr) {
      dateRanges.push({
        start_date: formatDateForAPI(Number(fromStr)),
        end_date: formatDateForAPI(Number(toStr)),
      });
    }
  }

  return dateRanges;
};
