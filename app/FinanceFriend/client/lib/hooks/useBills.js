"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";
import { queryClient } from "../queryClient";

/**
 * Hook for fetching and managing bills
 */
export function useBills() {
  // Fetch all bills
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/bills"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/bills");
      return res.json();
    },
  });

  // Fetch due bills
  const dueBillsQuery = useQuery({
    queryKey: ["/api/bills/due"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/bills/due");
      return res.json();
    },
  });

  // Add bill
  const addBillMutation = useMutation({
    mutationFn: async (newBill) => {
      const res = await apiRequest("POST", "/api/bills", newBill);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills/due"] });
    },
  });

  // Update bill
  const updateBillMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest("PUT", `/api/bills/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills/due"] });
    },
  });

  // Mark bill as paid
  const markBillAsPaidMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiRequest("PUT", `/api/bills/${id}/pay`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills/due"] });
    },
  });

  // Delete bill
  const deleteBillMutation = useMutation({
    mutationFn: async (id) => {
      await apiRequest("DELETE", `/api/bills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills/due"] });
    },
  });

  return {
    data,
    isLoading,
    error,
    dueBills: dueBillsQuery.data,
    isDueBillsLoading: dueBillsQuery.isLoading,
    addBill: addBillMutation.mutate,
    updateBill: updateBillMutation.mutate,
    markBillAsPaid: markBillAsPaidMutation.mutate,
    deleteBill: deleteBillMutation.mutate,
  };
}