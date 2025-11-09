"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";
import { queryClient } from "../queryClient";

/**
 * Hook for fetching and managing savings goals
 */
export function useGoals() {
  // Fetch goals
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/goals");
      return res.json();
    },
  });

  // Add goal
  const addGoalMutation = useMutation({
    mutationFn: async (newGoal) => {
      const res = await apiRequest("POST", "/api/goals", newGoal);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  // Update goal
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest("PUT", `/api/goals/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  // Delete goal
  const deleteGoalMutation = useMutation({
    mutationFn: async (id) => {
      await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  return {
    data,
    isLoading,
    error,
    addGoal: (goal) => addGoalMutation.mutateAsync(goal),
    updateGoal: (id, data) => updateGoalMutation.mutateAsync({ id, data }),
    deleteGoal: (id) => deleteGoalMutation.mutateAsync(id),
  };
}