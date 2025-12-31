import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../queryClient";
import { type Bill } from "../../../shared/schema";

export const useAddBill = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Bill,
    Error,
    Omit<Bill, "id" | "userId"> & { userId?: number },
    { previousBills?: Bill[] }
  >({
    mutationFn: async (newBill) => {
      const response = await apiRequest("POST", "/api/bills", { ...newBill, userId: 1 }); // Demo user ID
      return response.json();
    },
    onMutate: async (newBill) => {
      await queryClient.cancelQueries({ queryKey: ["/api/bills"] });
      const previousBills = queryClient.getQueryData<Bill[]>(["/api/bills"]);
      
      const optimisticBill: Bill = {
        id: Date.now(),
        ...newBill,
        userId: 1, // Demo user ID
      };

      queryClient.setQueryData<Bill[]>(["/api/bills"], (old = []) => [...old, optimisticBill]);
      
      toast({
        title: "Bill added",
        description: "Your bill has been added successfully.",
      });
      
      return { previousBills };
    },
    onError: (err, newBill, context) => {
      if (context?.previousBills) {
        queryClient.setQueryData(["/api/bills"], context.previousBills);
      }
      toast({
        title: "Error",
        description: "There was an error adding your bill.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
    },
  });
};
