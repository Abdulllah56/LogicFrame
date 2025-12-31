import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "../queryClient";
import { queryClient } from "../queryClient";

type Budget = {
  id: number;
  userId: number;
  categoryId: number | null;
  amount: number;
  period: string;
};


/**
 * Hook for fetching and managing budgets
 */
export function useBudgets() {
  // Fetch budgets
  const { data, isLoading, error } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Add budget
  const addBudgetMutation = useMutation({
    mutationFn: async (newBudget: any) => {
      const res = await apiRequest("POST", "/api/budgets", newBudget);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
    }
  });

  // Update budget
  const updateBudgetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest("PUT", `/api/budgets/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
    }
  });

  // Delete budget
  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
    }
  });

  return {
    data,
    isLoading,
    error,
    addBudget: (budget: any) => addBudgetMutation.mutateAsync(budget),
    updateBudget: (id: number, data: any) => updateBudgetMutation.mutateAsync({ id, data }),
    deleteBudget: deleteBudgetMutation.mutate,
  };
}