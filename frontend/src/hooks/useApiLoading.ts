import { useEffect, useState } from 'react';
import { apiLoading } from '../services/apiLoading.js';

export function useApiLoading() {
  const [pendingCount, setPendingCount] = useState(() => apiLoading.getCount());

  useEffect(() => {
    return apiLoading.subscribe(setPendingCount);
  }, []);

  return {
    pendingCount,
    isLoading: pendingCount > 0,
  };
}

