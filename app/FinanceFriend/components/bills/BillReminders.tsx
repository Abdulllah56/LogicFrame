'use client';

import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CalendarIcon, Plus } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
// Removed unused imports: apiRequest, queryClient (they were only used for type inference/side effects in the original file, but not in the component itself)
// Removed unused imports: useToast, zodResolver, useForm, Controller, z (although used for logic, we will define them as imports)
import { useAddBill } from "../../client/lib/hooks/useAddBill";
import { useToast } from "../../client/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
  isRecurring: boolean;
  recurringPeriod?: string;
}

interface BillRemindersProps {
  bills: Bill[];
  onMarkAsPaid: (id: number) => Promise<void>;
}

const billSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.string()
    .transform(val => parseFloat(val))
    .refine(val => !isNaN(val) && val > 0, "Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.string().optional(),
});

type BillFormValues = z.infer<typeof billSchema>;

export function BillReminders({ bills, onMarkAsPaid }: Omit<BillRemindersProps, 'onAddBill'>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { mutate: addBill, isPending } = useAddBill();

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      name: "",
      amount: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      isRecurring: false,
      recurringPeriod: "monthly",
    }
  });

  const isRecurring = watch("isRecurring");

  const onSubmit = (data: BillFormValues) => {
    addBill({
      name: data.name,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      isPaid: false,
      isRecurring: data.isRecurring,
      recurringPeriod: data.isRecurring ? data.recurringPeriod : undefined,
    }, {
      onSuccess: () => {
        reset();
        setIsDialogOpen(false);
      }
    });
  };

  const getDueDaysText = (dueDate: Date) => {
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days < 0) return "Overdue";
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `${days} days`;
  };

  const getDueClassNames = (dueDate: Date) => {
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days < 0) return "text-red-500";
    if (days <= 3) return "text-red-500";
    if (days <= 7) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <>
      <Card className="bg-white/[0.02] backdrop-blur-md rounded-xl shadow-sm border border-border">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-foreground">Upcoming Bills</h3>
            <Button
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4" /> Add Bill
            </Button>
          </div>

          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill.id} className="flex justify-between items-center border-b border-border pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{bill.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Due: {format(new Date(bill.dueDate), "MMM d, yyyy")}
                      </span>
                      {bill.isRecurring && (
                        <Badge variant="outline" className="text-xs">
                          {bill.recurringPeriod}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-semibold text-foreground">${bill.amount.toFixed(2)}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${getDueClassNames(bill.dueDate)}`}>
                      {getDueDaysText(bill.dueDate)}
                    </span>
                    {!bill.isPaid && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => onMarkAsPaid(bill.id)}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {bills.length === 0 && (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm mb-4">No upcoming bills</p>
                <Button
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Add Your First Bill
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Add New Bill</DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a bill reminder to never miss a payment
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-black">Bill Name</Label>
              <Input
                id="name"
                placeholder="e.g. Rent, Internet, etc."
                className="bg-white text-black placeholder:text-gray-400 border-gray-300"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-black">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="amount"
                  placeholder="0.00"
                  className="pl-8 bg-white text-black placeholder:text-gray-400 border-gray-300"
                  {...register("amount")}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-black">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                className="bg-white text-black border-gray-300"
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isRecurring" className="text-black">Recurring Bill</Label>
              <Controller
                name="isRecurring"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurringPeriod" className="text-black">Recurring Period</Label>
                <Controller
                  name="recurringPeriod"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-white text-black border-gray-300">
                        <SelectValue placeholder="Select a period" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black">
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-300 text-black hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Bill</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
