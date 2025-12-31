"use client";
import { useQuery, useMutation } from "@tanstack/react-query";

import { apiRequest, getQueryFn } from "../queryClient";
import { queryClient } from "../queryClient";

/**
 * Hook for fetching and managing bills
 */
export function useBills() {
  // Fetch all bills
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/bills"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Fetch due bills
  const dueBillsQuery = useQuery({
    queryKey: ["/api/bills/due"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Add bill
  const addBillMutation = useMutation({
    onMutate: async (newBill) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["/api/bills"] });

      // Snapshot the previous value
      const previousBills = queryClient.getQueryData(["/api/bills"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["/api/bills"], (old: any) => {
        const newId = (old?.length || 0) > 0 ? Math.max(...old.map((b: any) => b.id)) + 1 : 1;
        return [...(old || []), { id: newId, ...newBill }];
      });

      return { previousBills };
    },
    onError: (err, newBill, context) => {
      queryClient.setQueryData(["/api/bills"], context?.previousBills);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills/due"] });
    }
  });
  
  // Update bill
  const updateBillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest("PUT", `/api/bills/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills/due"] });
    }
  });
  
  // Mark bill as paid
  const markBillAsPaidMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/bills/${id}/pay`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills/due"] });
    }
  });
  
  // Delete bill
  const deleteBillMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills/due"] });
    }
  });
  
  return {
    data,
    isLoading,
    error,
    dueBills: dueBillsQuery.data,
    isDueBillsLoading: dueBillsQuery.isLoading,
    addBill: addBillMutation.mutateAsync,
    updateBill: updateBillMutation.mutate,
    markBillAsPaid: markBillAsPaidMutation.mutate,
    deleteBill: deleteBillMutation.mutate,
  };
}
