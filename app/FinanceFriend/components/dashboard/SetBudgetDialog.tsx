"use client"

import { useState, useEffect } from "react";
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

interface SetBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthlyBudget: number;
  weeklyBudget: number;
  onSave: (monthly: number, weekly: number) => void;
}

export function SetBudgetDialog({
  open,
  onOpenChange,
  monthlyBudget,
  weeklyBudget,
  onSave,
}: SetBudgetDialogProps) {
  const [currentMonthlyBudget, setCurrentMonthlyBudget] = useState(monthlyBudget);
  const [currentWeeklyBudget, setCurrentWeeklyBudget] = useState(weeklyBudget);

  useEffect(() => {
    setCurrentMonthlyBudget(monthlyBudget);
    setCurrentWeeklyBudget(weeklyBudget);
  }, [monthlyBudget, weeklyBudget]);

  const handleSave = () => {
    onSave(currentMonthlyBudget, currentWeeklyBudget);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white text-black">
        <DialogHeader>
          <DialogTitle>Set Your Budget</DialogTitle>
          <DialogDescription>
            Set your desired monthly and weekly budget. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="monthlyBudget" className="text-right">
              Monthly Budget
            </Label>
            <Input
              id="monthlyBudget"
              type="number"
              value={currentMonthlyBudget}
              onChange={(e) => setCurrentMonthlyBudget(parseFloat(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weeklyBudget" className="text-right">
              Weekly Budget
            </Label>
            <Input
              id="weeklyBudget"
              type="number"
              value={currentWeeklyBudget}
              onChange={(e) => setCurrentWeeklyBudget(parseFloat(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Budget</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
