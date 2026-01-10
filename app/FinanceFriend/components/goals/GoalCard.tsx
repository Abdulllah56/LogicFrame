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
  DialogDescription,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { apiRequest } from "../../client/lib/queryClient";
import { queryClient } from "../../client/lib/queryClient";
import { useToast } from "../../client/hooks/use-toast";

interface GoalCardProps {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  icon: string;
  onUpdate: (id: number, amount: number) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

export function GoalCard({
  id,
  name,
  targetAmount,
  currentAmount,
  targetDate,
  icon,
  onUpdate,
  onDelete
}: GoalCardProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [editName, setEditName] = useState(name);
  const [editTargetAmount, setEditTargetAmount] = useState(targetAmount.toString());
  const [editTargetDate, setEditTargetDate] = useState(
    targetDate ? format(new Date(targetDate), "yyyy-MM-dd") : ""
  );
  const { toast } = useToast();

  const percentComplete = Math.round((currentAmount / targetAmount) * 100);

  let dailyAmount = 0;
  if (targetDate) {
    const daysLeft = Math.max(1, Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
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

  const handleEdit = async () => {
    const newTargetAmount = parseFloat(editTargetAmount);

    if (!editName || isNaN(newTargetAmount) || newTargetAmount <= 0) {
      toast({
        title: "Invalid input",
        description: "Please provide valid goal details",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("PUT", `/api/goals/${id}`, {
        name: editName,
        targetAmount: newTargetAmount,
        targetDate: editTargetDate ? new Date(editTargetDate).toISOString() : null,
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/goals"] });

      toast({
        title: "Goal updated",
        description: "Your goal has been updated successfully",
      });

      setIsEditOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (onDelete) {
        await onDelete(id);
      } else {
        await apiRequest("DELETE", `/api/goals/${id}`);
        await queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      }

      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully",
      });

      setIsDeleteOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="bg-slate-900 border border-slate-800 text-white shadow-lg hover:shadow-cyan-900/20 hover:border-cyan-500/30 transition-all duration-300">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-white text-lg">{name}</h3>
              <p className="text-xs text-slate-400">
                {targetDate
                  ? `Target date: ${format(new Date(targetDate), 'MMM yyyy')}`
                  : 'Ongoing'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-cyan-950/50 border border-cyan-500/20">
                <i className={`${icon} text-cyan-400`}></i>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800">
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-white">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="focus:bg-slate-800 focus:text-cyan-400 cursor-pointer">
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Goal
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteOpen(true)}
                    className="text-red-400 focus:bg-slate-800 focus:text-red-300 cursor-pointer"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Goal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-sm text-slate-400">Goal: ${targetAmount.toFixed(2)}</p>
              <p className="text-lg font-semibold text-white">${currentAmount.toFixed(2)} saved</p>
            </div>
            <span className="text-sm font-medium text-cyan-400">{percentComplete}%</span>
          </div>

          <Progress className="h-2 bg-slate-800 [&>div]:bg-cyan-500" value={percentComplete} />

          <p className="text-xs text-slate-500 mt-2">
            {targetDate
              ? `$${dailyAmount.toFixed(2)}/day to reach your goal`
              : `$${(targetAmount * 0.05).toFixed(2)}/month recommended saving`}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-cyan-500/50"
            onClick={() => setIsUpdateOpen(true)}
          >
            Add Contribution
          </Button>
        </CardFooter>
      </Card>

      {/* Add Contribution Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add Contribution</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-slate-300">Goal Progress:</span>
              <span className="text-sm font-medium text-cyan-400">${currentAmount.toFixed(2)} / ${targetAmount.toFixed(2)}</span>
            </div>

            <Progress value={percentComplete} className="h-2 bg-slate-800 [&>div]:bg-cyan-500" />

            <div className="space-y-2 pt-2">
              <Label htmlFor="contribution" className="text-slate-300">Contribution Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                <Input
                  id="contribution"
                  placeholder="0.00"
                  className="pl-8 bg-slate-950 text-white border-slate-700 focus-visible:ring-cyan-500"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleContribute} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              Add Contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Goal</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-slate-300">Goal Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-slate-950 text-white border-slate-700 focus-visible:ring-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-target" className="text-slate-300">Target Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                <Input
                  id="edit-target"
                  placeholder="0.00"
                  className="pl-8 bg-slate-950 text-white border-slate-700 focus-visible:ring-cyan-500"
                  value={editTargetAmount}
                  onChange={(e) => setEditTargetAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date" className="text-slate-300">Target Date (Optional)</Label>
              <Input
                id="edit-date"
                type="date"
                value={editTargetDate}
                onChange={(e) => setEditTargetDate(e.target.value)}
                className="bg-slate-950 text-white border-slate-700 focus-visible:ring-cyan-500 [color-scheme:dark]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleEdit} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Goal</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete &quot;{name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
