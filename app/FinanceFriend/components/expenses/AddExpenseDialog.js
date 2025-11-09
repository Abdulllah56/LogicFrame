"use client";

import { useState } from "react";
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
import { parseAmount, parseExpenseText } from "../../client/utils/expense-parser";
import { SmartExpenseInput } from "./SmartExpenseInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { format } from "date-fns";

const expenseSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform(parseAmount)
    .refine((val) => val > 0, {
      message: "Amount must be greater than 0",
    }),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  categoryId: z
    .string()
    .min(1, "Category is required")
    .transform((val) => parseInt(val, 10)),
  quickInput: z.string().optional(),
});

export function AddExpenseDialog({ open, onOpenChange }) {
  const { toast } = useToast();
  const { data: categoriesData } = useCategories();
  const [isProcessingQuickInput, setIsProcessingQuickInput] = useState(false);

  // Ensure categories is array
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      categoryId: "",
      quickInput: "",
    },
  });

  const handleQuickInputChange = (text) => {
    if (text.trim()) {
      setIsProcessingQuickInput(true);
      const parsed = parseExpenseText(text);

      if (parsed.amount) {
        setValue("amount", parsed.amount.toString());
      }

      if (parsed.description) {
        setValue("description", parsed.description);
      }

      if (parsed.category) {
        const matchedCategory = categories.find((cat) =>
          cat.name.toLowerCase().includes(parsed.category.toLowerCase())
        );

        if (matchedCategory) {
          setValue("categoryId", matchedCategory.id.toString());
        }
      }

      setIsProcessingQuickInput(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log("Submitting expense with validated data:", {
        amount: data.amount,
        description: data.description || "",
        date: data.date,
        categoryId: data.categoryId,
      });

      // Validate date string format
      const dateObj = new Date(data.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date format");
      }

      const response = await apiRequest("POST", "/api/expenses", {
        userId: 1, // Demo user ID
        amount: data.amount,
        description: data.description || "",
        date: dateObj.toISOString(),
        categoryId: data.categoryId,
      });

      console.log("Expense created successfully");

      // Invalidate cache to refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });

      toast({
        title: "Expense added",
        description: "Your expense has been added successfully",
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      let errorMessage =
        "There was an error adding your expense. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleQuickInputChangeWrapped = (value) => {
    handleQuickInputChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of your expense
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quickInput">Quick Input</Label>
            <SmartExpenseInput
              placeholder="e.g. Coffee $4.50"
              onChange={handleQuickInputChangeWrapped}
              id="quickInput"
            />
            <p className="text-xs text-gray-500">
              Try typing "Coffee $4.50" for automatic categorization
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="amount"
                  placeholder="0.00"
                  className="pl-8"
                  {...register("amount")}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-red-500">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Note (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a note..."
              {...register("description")}
            />
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}