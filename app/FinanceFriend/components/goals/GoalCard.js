"use client";

import { format } from "date-fns";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";
import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  } from "../../components/ui/dialog";
  import { apiRequest } from "../../client/lib/queryClient";
import { queryClient } from "../../client/lib/queryClient";
import { useToast } from "../../client/hooks/use-toast";

export function GoalCard({
  id,
  name,
  targetAmount,
  currentAmount,
  targetDate,
  icon,
  onUpdate,
}) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const { toast } = useToast();

  const percentComplete = Math.round((currentAmount / targetAmount) * 100);

  let dailyAmount = 0;
  if (targetDate) {
    const daysLeft = Math.max(
      1,
      Math.ceil(
        (new Date(targetDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    dailyAmount = (targetAmount - currentAmount) / daysLeft;
  }

  const handleContribute = async () => {
    const amount = parseFloat(contributionAmount);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to contribute",
        variant: "destructive",
      });
      return;
    }

    try {
      await onUpdate(id, currentAmount + amount);

      toast({
        title: "Contribution added",
        description: `Added $${amount.toFixed(2)} to your ${name} goal`,
      });

      setContributionAmount("");
      setIsUpdateOpen(false);
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "There was an error adding your contribution. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="bg-white">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{name}</h3>
              <p className="text-xs text-gray-500">
                {targetDate
                  ? `Target date: ${format(new Date(targetDate), "MMM yyyy")}`
                  : "Ongoing"}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100">
              <i className={`${icon} text-blue-600`}></i>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-sm text-gray-500">
                Goal: ${targetAmount.toFixed(2)}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                ${currentAmount.toFixed(2)} saved
              </p>
            </div>
            <span className="text-sm font-medium text-blue-600">
              {percentComplete}%
            </span>
          </div>

          <Progress className="h-2 bg-gray-200" value={percentComplete} />

          <p className="text-xs text-gray-500 mt-2">
            {targetDate
              ? `$${dailyAmount.toFixed(2)}/day to reach your goal`
              : `$${(targetAmount * 0.05).toFixed(2)}/month recommended saving`}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setIsUpdateOpen(true)}
          >
            Add Contribution
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Goal Progress:</span>
              <span className="text-sm font-medium">
                ${currentAmount.toFixed(2)} / ${targetAmount.toFixed(2)}
              </span>
            </div>

            <Progress value={percentComplete} className="h-2" />

            <div className="space-y-2 pt-2">
              <Label htmlFor="contribution">Contribution Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="contribution"
                  placeholder="0.00"
                  className="pl-8"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleContribute}>Add Contribution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}