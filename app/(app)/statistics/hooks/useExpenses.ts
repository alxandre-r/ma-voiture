import { useEffect, useState } from 'react';

import type { Expense } from '@/types/expense';

/** Fetches all expenses for the given vehicle IDs from the API. */
export function useExpenses(vehicleIds: number[]): { expenses: Expense[]; isLoading: boolean } {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!vehicleIds.length) {
      setIsLoading(false);
      return;
    }

    fetch(`/api/expenses/get?vehicleIds=${vehicleIds.join(',')}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.expenses) setExpenses(data.expenses);
      })
      .catch((err) => console.error('Failed to fetch expenses:', err))
      .finally(() => setIsLoading(false));
  }, [vehicleIds]);

  return { expenses, isLoading };
}
