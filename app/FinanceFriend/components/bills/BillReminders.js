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
import { useToast } from "../../client/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

// NOTE: TypeScript interfaces are removed. The JSDoc below describes the expected props and data structure.
/**
 * @typedef {object} Bill
 * @property {number} id
 * @property {string} name
 * @property {number} amount
 * @property {Date} dueDate
 * @property {boolean} isPaid
 * @property {boolean} isRecurring
 * @property {string=} recurringPeriod
 *
 * @typedef {object} BillRemindersProps
 * @property {Bill[]} bills
 * @property {(bill: Omit<Bill, "id">) => Promise<void>} onAddBill
 * @property {(id: number) => Promise<void>} onMarkAsPaid
 */


const billSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // The transform logic remains, ensuring the input string is converted to a number
  amount: z.string()
    .transform(val => parseFloat(val))
    .refine(val => !isNaN(val) && val > 0, "Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.string().optional(),
});

/**
 * @param {BillRemindersProps} props
 */
export function BillReminders({ bills, onAddBill, onMarkAsPaid }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Removed explicit type parameter <BillFormValues> from useForm
  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
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
  
  // Removed type annotation for data
  const onSubmit = async (data) => {
    try {
      await onAddBill({
        name: data.name,
        amount: data.amount,
        // Convert the date string from the form back to a Date object
        dueDate: new Date(data.dueDate), 
        isPaid: false,
        isRecurring: data.isRecurring,
        recurringPeriod: data.isRecurring ? data.recurringPeriod : undefined,
      });
      
      toast({
        title: "Bill added",
        description: "Your bill reminder has been added successfully",
      });
      
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "There was an error adding your bill. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  /**
   * @param {Date} dueDate
   */
  const getDueDaysText = (dueDate) => {
    // Ensure dueDate is converted to Date object if it's a string from props
    const date = new Date(dueDate);
    const days = differenceInDays(date, new Date());
    if (days < 0) return "Overdue";
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `${days} days`;
  };
  
  /**
   * @param {Date} dueDate
   */
  const getDueClassNames = (dueDate) => {
    // Ensure dueDate is converted to Date object if it's a string from props
    const date = new Date(dueDate);
    const days = differenceInDays(date, new Date());
    if (days < 0) return "text-red-500";
    if (days <= 3) return "text-red-500";
    if (days <= 7) return "text-yellow-500";
    return "text-green-500";
  };
  
  return (
    <>
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Bills</h3>
            <Button 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4" /> Add Bill
            </Button>
          </div>
          
          <div className="space-y-4">
            {bills
              .filter(bill => !bill.isPaid) // Filter out paid bills for the upcoming list
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)) // Sort by due date
              .map((bill) => (
              <div key={bill.id} className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{bill.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {/* Format date string to display */}
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
                  <span className="font-semibold text-gray-900">${bill.amount.toFixed(2)}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${getDueClassNames(bill.dueDate)}`}>
                      {getDueDaysText(bill.dueDate)}
                    </span>
                    {/* Check if bill is paid, but the original logic only showed the button if NOT paid, so we keep that */}
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
            
            {bills.filter(bill => !bill.isPaid).length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-4">No upcoming bills</p>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bill</DialogTitle>
            <DialogDescription>
              Add a bill reminder to never miss a payment
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Bill Name</Label>
              <Input
                id="name"
                placeholder="e.g. Rent, Internet, etc."
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
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
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate.message}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="isRecurring">Recurring Bill</Label>
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
                <Label htmlFor="recurringPeriod">Recurring Period</Label>
                <Controller
                  name="recurringPeriod"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a period" />
                      </SelectTrigger>
                      <SelectContent>
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
              >
                Cancel
              </Button>
              <Button type="submit">Add Bill</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
