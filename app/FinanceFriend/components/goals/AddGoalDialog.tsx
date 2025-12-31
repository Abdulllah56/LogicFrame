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
import { useAddGoal } from "../../client/lib/hooks/useAddGoal";
import { useToast } from "../../client/hooks/use-toast";

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const goalFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.string().min(1, "Target amount is required"),
  currentAmount: z.string().default(""),
  hasDeadline: z.boolean().default(true),
  targetDate: z.string().default(""),
  icon: z.string().default("ri-bank-line"),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

export function AddGoalDialog({ open, onOpenChange }: Omit<AddGoalDialogProps, 'onAddGoal'>) {
  const { toast } = useToast();
  const { mutate: addGoal, isPending } = useAddGoal();
  
  const defaultDate = format(addMonths(new Date(), 6), "yyyy-MM-dd");
  
  const form = useForm({
    resolver: zodResolver(goalFormSchema) as any,
    defaultValues: {
      name: "",
      targetAmount: "",
      currentAmount: "",
      hasDeadline: true,
      targetDate: defaultDate,
      icon: "ri-bank-line",
    }
  });
  
  const { register, handleSubmit, control, reset, watch, formState: { errors } } = form;
  
  const hasDeadline = watch("hasDeadline");
  
  const onSubmit = (data: GoalFormValues) => {
    try {
      const targetAmount = parseFloat(data.targetAmount);
      const currentAmount = parseFloat(data.currentAmount || "0");
      
      if (isNaN(targetAmount) || targetAmount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Target amount must be greater than 0",
          variant: "destructive",
        });
        return;
      }
      
      if (isNaN(currentAmount) || currentAmount < 0) {
        toast({
          title: "Invalid amount",
          description: "Current amount must be 0 or greater",
          variant: "destructive",
        });
        return;
      }
      
      const goalData = {
        name: data.name,
        targetAmount,
        currentAmount,
        targetDate: data.hasDeadline && data.targetDate ? new Date(data.targetDate) : null,
        icon: data.icon,
      };
      
      addGoal(goalData, {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        }
      });
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "There was an error creating your goal. Please try again.",
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
      <DialogContent className="sm:max-w-md bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-black">Create New Savings Goal</DialogTitle>
          <DialogDescription className="text-gray-600">
            Set a target and track your progress towards your financial goal
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-black">Goal Name</Label>
            <Input
              id="name"
              placeholder="e.g. Trip to Japan, New Car, etc."
              className="bg-white text-black placeholder:text-gray-400 border-gray-300"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetAmount" className="text-black">Target Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="targetAmount"
                placeholder="0.00"
                className="pl-8 bg-white text-black placeholder:text-gray-400 border-gray-300"
                {...register("targetAmount")}
              />
            </div>
            {errors.targetAmount && (
              <p className="text-sm text-red-500">{errors.targetAmount.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currentAmount" className="text-black">Current Savings (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="currentAmount"
                placeholder="0.00"
                className="pl-8 bg-white text-black placeholder:text-gray-400 border-gray-300"
                {...register("currentAmount")}
              />
            </div>
            {errors.currentAmount && (
              <p className="text-sm text-red-500">{errors.currentAmount.message}</p>
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
            <Label htmlFor="hasDeadline" className="text-black">Set a target date</Label>
          </div>
          
          {hasDeadline && (
            <div className="space-y-2">
              <Label htmlFor="targetDate" className="text-black">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                className="bg-white text-black border-gray-300"
                {...register("targetDate")}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="icon" className="text-black">Goal Icon</Label>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className="bg-white text-black border-gray-300" id="icon">
                    <SelectValue placeholder="Select an icon" className="text-gray-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black" position="popper" sideOffset={5}>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <i className={`${icon.value} text-base`} style={{ display: 'inline-block', width: '20px' }}></i>
                          <span>{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={handleClose} className="border-gray-300 text-black hover:bg-gray-100">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Create Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
