import { useEffect, useState } from 'react';

import type { Expense } from '@/types/expense';

interface UseExpensesResult {
  expenses: Expense[];
  isLoading: boolean;
  isError: boolean;
}

/** Fetches all expenses for the given vehicle IDs from the API. */
export function useExpenses(vehicleIds: number[]): UseExpensesResult {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!vehicleIds.length) {
      setIsLoading(false);
      return;
    }

    setIsError(false);
    fetch(`/api/expenses/get?vehicleIds=${vehicleIds.join(',')}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.expenses) setExpenses(data.expenses);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [vehicleIds]);

  return { expenses, isLoading, isError };
}
