import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "../queryClient";
import { queryClient } from "../queryClient";


/**
 * Hook for fetching and managing savings goals
 */
export function useGoals() {
  // Fetch goals
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Add goal
  const addGoalMutation = useMutation({
    mutationFn: async (newGoal: any) => {
      const res = await apiRequest("POST", "/api/goals", newGoal);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    }
  });
  
  // Update goal
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest("PUT", `/api/goals/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    }
  });
  
  // Delete goal
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    }
  });
  
  return {
    data,
    isLoading,
    error,
    addGoal: (goal: any) => addGoalMutation.mutateAsync(goal),
    updateGoal: (id: number, data: any) => updateGoalMutation.mutateAsync({ id, data }),
    deleteGoal: deleteGoalMutation.mutate,
  };
}
