import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "../queryClient";
import { queryClient } from "../queryClient";


/**
 * Hook for fetching categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

/**
 * Hook for fetching and managing expenses
 */
export function useExpenses(endpoint = "/api/expenses") {
  // Fetch expenses
  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Add expense
  const addExpenseMutation = useMutation({
    mutationFn: async (newExpense: any) => {
      const res = await apiRequest("POST", "/api/expenses", newExpense);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    }
  });
  
  // Update expense
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest("PUT", `/api/expenses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    }
  });
  
  // Delete expense
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    }
  });
  
  // Get expenses by date range
  const getExpensesByDateRange = async (startDate: Date, endDate: Date) => {
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    const res = await fetch(`/api/expenses/range?start=${start}&end=${end}`, {
      credentials: "include",
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch expenses: ${res.status}`);
    }
    
    return res.json();
  };
  
  const getExpensesByDateRangeMutation = useMutation({
    mutationFn: async ({ startDate, endDate }: { startDate: Date, endDate: Date }) => {
      return getExpensesByDateRange(startDate, endDate);
    },
  });
  
  return {
    data,
    isLoading,
    error,
    addExpense: addExpenseMutation.mutate,
    updateExpense: updateExpenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate,
    getExpensesByDateRange: getExpensesByDateRangeMutation.mutate,
  };
}
