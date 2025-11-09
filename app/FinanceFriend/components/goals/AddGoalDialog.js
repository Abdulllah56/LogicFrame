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
import { Label } from "../../components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addMonths } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useToast } from "../../client/hooks/use-toast";

const goalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, "Target amount must be greater than 0"),
  currentAmount: z
    .string()
    .transform((val) => parseFloat(val || "0"))
    .refine((val) => !isNaN(val) && val >= 0, "Current amount must be 0 or greater"),
  hasDeadline: z.boolean().default(true),
  targetDate: z.string().optional(),
  icon: z.string().default("ri-bank-line"),
});

export function AddGoalDialog({ open, onOpenChange, onAddGoal }) {
  const { toast } = useToast();
  const defaultDate = format(addMonths(new Date(), 6), "yyyy-MM-dd");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      targetAmount: "",
      currentAmount: "",
      hasDeadline: true,
      targetDate: defaultDate,
      icon: "ri-bank-line",
    },
  });

  const hasDeadline = watch("hasDeadline");

  const onSubmit = async (data) => {
    try {
      await onAddGoal({
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount,
        targetDate: data.hasDeadline ? new Date(data.targetDate) : null,
        icon: data.icon,
      });

      toast({
        title: "Goal created",
        description: "Your savings goal has been created successfully",
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "There was an error creating your goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const iconOptions = [
    { value: "ri-plane-line", label: "Travel" },
    { value: "ri-home-line", label: "Home" },
    { value: "ri-car-line", label: "Car" },
    { value: "ri-computer-line", label: "Electronics" },
    { value: "ri-bank-line", label: "Savings" },
    { value: "ri-graduation-cap-line", label: "Education" },
    { value: "ri-heart-line", label: "Health" },
    { value: "ri-gift-line", label: "Gift" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Savings Goal</DialogTitle>
          <DialogDescription>
            Set a target and track your progress towards your financial goal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              placeholder="e.g. Trip to Japan, New Car, etc."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="targetAmount"
                placeholder="0.00"
                className="pl-8"
                {...register("targetAmount")}
              />
            </div>
            {errors.targetAmount && (
              <p className="text-sm text-red-500">
                {errors.targetAmount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentAmount">Current Savings (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="currentAmount"
                placeholder="0.00"
                className="pl-8"
                {...register("currentAmount")}
              />
            </div>
            {errors.currentAmount && (
              <p className="text-sm text-red-500">
                {errors.currentAmount.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="hasDeadline"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  id="hasDeadline"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              )}
            />
            <Label htmlFor="hasDeadline">Set a target date</Label>
          </div>

          {hasDeadline && (
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                {...register("targetDate")}
              />
              {errors.targetDate && (
                <p className="text-sm text-red-500">
                  {errors.targetDate.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="icon">Goal Icon</Label>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center">
                          <i className={`${icon.value} mr-2`}></i>
                          {icon.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}