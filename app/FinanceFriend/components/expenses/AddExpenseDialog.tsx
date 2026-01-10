import { useState } from "react";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "../../client/hooks/use-toast";
import { apiRequest } from "../../client/lib/queryClient";
import { queryClient } from "../../client/lib/queryClient";
import { useCategories } from "../../client/lib/hooks/useExpenses";
import { parseAmount, parseExpenseText } from "../../client/lib/utils/expense-parser";
import { SmartExpenseInput } from "./SmartExpenseInput";
import { useAddExpense } from "../../client/lib/hooks/useAddExpense";
import { useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { type Expense, type Category } from "../../shared/schema";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const expenseFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  categoryId: z.string().min(1, "Category is required"),
  quickInput: z.string().optional(),
  currency: z.string().default("USD"),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const { toast } = useToast();
  const { data: categoriesData } = useCategories();
  const [isProcessingQuickInput, setIsProcessingQuickInput] = useState(false);

  const currencies = [
    { value: "USD", symbol: "$" },
    { value: "EUR", symbol: "€" },
    { value: "GBP", symbol: "£" },
    { value: "INR", symbol: "₹" },
    { value: "AED", symbol: "د.إ" }, // UAE Dirham, common in some regions
  ];

  const categories: Category[] = Array.isArray(categoriesData) ? categoriesData : [];

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      categoryId: "",
      quickInput: "",
      currency: "USD",
    }
  });

  const { mutate: addExpense, isPending } = useAddExpense();

  const handleQuickInputChange = (text: string) => {
    if (text.trim()) {
      setIsProcessingQuickInput(true);
      const parsed = parseExpenseText(text);

      if (parsed.amount) setValue("amount", parsed.amount.toString());
      if (parsed.description) setValue("description", parsed.description);

      if (parsed.category) {
        const matchedCategory = categories.find(
          (cat) => cat.name.toLowerCase().includes(parsed.category!.toLowerCase())
        );
        if (matchedCategory) setValue("categoryId", matchedCategory.id.toString());
      }

      setIsProcessingQuickInput(false);
    }
  };

  const onSubmit = (data: ExpenseFormValues) => {
    try {
      const amount = parseAmount(data.amount);
      const categoryId = parseInt(data.categoryId, 10);

      if (amount <= 0) throw new Error("Amount must be greater than 0");

      const dateObj = new Date(data.date);
      if (isNaN(dateObj.getTime())) throw new Error("Invalid date format");

      addExpense({
        amount,
        description: data.description || "",
        date: dateObj.toISOString(),
        categoryId,
        currency: data.currency,
      }, {
        onSuccess: () => {
          onOpenChange(false);
          reset();
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid data.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleQuickInputChangeWrapped = (value: string) => {
    handleQuickInputChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-black">Add New Expense</DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter the details of your expense
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quickInput" className="text-black">Quick Input</Label>
            <SmartExpenseInput
              placeholder="e.g. Coffee $4.50"
              onChange={handleQuickInputChangeWrapped}
              id="quickInput"
              className="bg-white text-black placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500">
              Try typing &quot;Coffee $4.50&quot; for automatic categorization
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-black">Amount</Label>
              <div className="relative">
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="absolute left-0 top-1/2 transform -translate-y-1/2 w-16 h-full rounded-r-none border-r-0 bg-gray-100 text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black" position="popper" sideOffset={5}>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Input
                  id="amount"
                  placeholder="0.00"
                  className="pl-16 bg-white text-black placeholder:text-gray-400 border-gray-300"
                  {...register("amount")}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-black">Date</Label>
              <Input
                id="date"
                type="date"
                className="bg-white text-black border-gray-300"
                {...register("date")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-black">Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                >
                  <SelectTrigger className="bg-white text-black border-gray-300" id="category">
                    <SelectValue placeholder="Select a category" className="text-gray-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black" position="popper" sideOffset={5}>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-red-500">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-black">Note (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a note..."
              className="bg-white text-black placeholder:text-gray-400 border-gray-300"
              {...register("description")}
            />
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={handleClose} className="border-gray-300 text-black hover:bg-gray-100">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
              {isPending ? "Saving..." : "Save Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
