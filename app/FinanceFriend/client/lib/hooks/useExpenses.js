"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";
import { queryClient } from "../queryClient";

/**
 * Hook for fetching categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/categories");
      return res.json();
    },
  });
}

/**
 * Hook for fetching and managing expenses
 */
export function useExpenses(endpoint = "/api/expenses") {
  // Fetch expenses
  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const res = await apiRequest("GET", endpoint);
      return res.json();
    },
  });
  
  // Add expense
  const addExpenseMutation = useMutation({
    mutationFn: async (newExpense) => {
      const res = await apiRequest("POST", "/api/expenses", newExpense);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
  });
  
  // Update expense
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest("PUT", `/api/expenses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
  });
  
  // Delete expense
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
  });
  
  // Get expenses by date range - Helper function
  const getExpensesByDateRange = async (startDate, endDate) => {
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
    mutationFn: async ({ startDate, endDate }) => {
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