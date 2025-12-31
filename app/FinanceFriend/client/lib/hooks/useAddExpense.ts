import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../queryClient";
import { type Expense } from "../../../shared/schema";

export const useAddExpense = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Expense,
    Error,
    Omit<Expense, "id" | "userId" | "createdAt"> & { userId?: number },
    { previousExpenses?: Expense[] }
  >({
    mutationFn: async (newExpense) => {
      const response = await apiRequest("POST", "/api/expenses", { ...newExpense, userId: 1 }); // Demo user ID
      return response.json();
    },
    onMutate: async (newExpense) => {
      await queryClient.cancelQueries({ queryKey: ["/api/expenses"] });
      const previousExpenses = queryClient.getQueryData<Expense[]>(["/api/expenses"]);
      
      const optimisticExpense: Expense = {
        id: Date.now(),
        ...newExpense,
        userId: 1, // Demo user ID
        description: newExpense.description || null,
        currency: newExpense.currency || "USD",
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Expense[]>(["/api/expenses"], (old = []) => [...old, optimisticExpense]);
      
      toast({
        title: "Expense added",
        description: "Your expense has been added successfully.",
      });
      
      return { previousExpenses };
    },
    onError: (err, newExpense, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(["/api/expenses"], context.previousExpenses);
      }
      toast({
        title: "Error",
        description: "There was an error adding your expense.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
  });
};
