import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../queryClient";
import { type Goal } from "../../../shared/schema";

export const useAddGoal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Goal,
    Error,
    Omit<Goal, "id" | "userId"> & { userId?: number },
    { previousGoals?: Goal[] }
  >({
    mutationFn: async (newGoal) => {
      const response = await apiRequest("POST", "/api/goals", { ...newGoal, userId: 1 }); // Demo user ID
      return response.json();
    },
    onMutate: async (newGoal) => {
      await queryClient.cancelQueries({ queryKey: ["/api/goals"] });
      const previousGoals = queryClient.getQueryData<Goal[]>(["/api/goals"]);
      
      const optimisticGoal: Goal = {
        id: Date.now(),
        ...newGoal,
        userId: 1, // Demo user ID
      };

      queryClient.setQueryData<Goal[]>(["/api/goals"], (old = []) => [...old, optimisticGoal]);
      
      toast({
        title: "Goal added",
        description: "Your goal has been added successfully.",
      });
      
      return { previousGoals };
    },
    onError: (err, newGoal, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(["/api/goals"], context.previousGoals);
      }
      toast({
        title: "Error",
        description: "There was an error adding your goal.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });
};
