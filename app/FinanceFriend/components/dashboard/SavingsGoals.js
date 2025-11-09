'use client';

import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { AddGoalDialog } from "../goals/AddGoalDialog";
import { useState } from "react";
import { format } from "date-fns";

export function SavingsGoals({ goals = [], onAddGoal }) {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);

  // Calculate progress and daily savings
  const calculateGoalStats = (goal) => {
    const target = goal.targetAmount || 0;
    const current = goal.currentAmount || 0;
    const percentComplete = target > 0 ? Math.round((current / target) * 100) : 0;

    let dailyAmount = 0;
    if (goal.targetDate) {
      const now = new Date();
      const target = new Date(goal.targetDate);
      const daysLeft = Math.max(1, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
      dailyAmount = (target - current) / daysLeft;
    }

    return { percentComplete, dailyAmount: Math.max(0, dailyAmount) };
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Savings Goals</h3>
          <Button
            variant="link"
            className="text-primary-500 hover:text-primary-600 font-medium"
            onClick={() => setIsAddGoalOpen(true)}
          >
            + New Goal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.length > 0 ? (
            goals.map((goal) => {
              const { percentComplete, dailyAmount } = calculateGoalStats(goal);

              return (
                <div
                  key={goal.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{goal.name}</h4>
                      <p className="text-xs text-gray-500">
                        {goal.targetDate
                          ? `Target date: ${format(
                              new Date(goal.targetDate),
                              "MMM yyyy"
                            )}`
                          : "Ongoing"}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100">
                      <i className={`${goal.icon || "ri-wallet-line"} text-blue-600`}></i>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-500">
                        Goal: ${Number(goal.targetAmount || 0).toFixed(2)}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${Number(goal.currentAmount || 0).toFixed(2)} saved
                      </p>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {percentComplete}%
                    </span>
                  </div>

                  <Progress className="h-2 bg-gray-200" value={percentComplete} />

                  <p className="text-xs text-gray-500 mt-2">
                    {goal.targetDate
                      ? `$${dailyAmount.toFixed(2)}/day to reach your goal`
                      : `$${(goal.targetAmount * 0.05).toFixed(2)}/month recommended saving`}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center">
              <p className="text-gray-500 mb-4">
                You don't have any savings goals yet
              </p>
              <Button size="sm" onClick={() => setIsAddGoalOpen(true)}>
                Create Your First Goal
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Add Goal Dialog */}
      <AddGoalDialog
        open={isAddGoalOpen}
        onOpenChange={setIsAddGoalOpen}
        onAddGoal={onAddGoal}
      />
    </Card>
  );
}