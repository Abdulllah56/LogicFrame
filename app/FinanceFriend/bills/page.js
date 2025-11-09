'use client';

import { useState } from "react";
import { useBills } from "../client/lib/hooks/useBills";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BillReminders } from "../components/bills/BillReminders";
import { CalendarIcon, PlusIcon, CheckCircleIcon } from "lucide-react";
import { formatCurrency } from "../client/utils/date-utils";
import { format, isAfter, addDays, isBefore } from "date-fns";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../client/hooks/use-toast";

export default function Bills() {
  const [tab, setTab] = useState("upcoming");
  const { data: bills, isLoading, addBill, markBillAsPaid } = useBills();
  const { toast } = useToast();
  
  const handleAddBill = async (bill) => {
    try {
      await addBill(bill);
      toast({
        title: "Bill added",
        description: "Your bill has been added successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add bill. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleMarkAsPaid = async (id) => {
    try {
      await markBillAsPaid(id);
      toast({
        title: "Bill marked as paid",
        description: "Your bill has been marked as paid",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark bill as paid. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Filter bills into upcoming, overdue, and paid
  const now = new Date();
  
  const upcomingBills = bills?.filter(bill => 
    !bill.isPaid && isAfter(new Date(bill.dueDate), now)
  ) || [];
  
  const overdueBills = bills?.filter(bill => 
    !bill.isPaid && isBefore(new Date(bill.dueDate), now)
  ) || [];
  
  const paidBills = bills?.filter(bill => bill.isPaid) || [];
  
  // Calculate upcoming bills by time period
  const thisWeekBills = upcomingBills.filter(bill => 
    isBefore(new Date(bill.dueDate), addDays(now, 7))
  );
  
  const thisMonthBills = upcomingBills.filter(bill => 
    isBefore(new Date(bill.dueDate), addDays(now, 30))
  );
  
  // Calculate totals
  const calculateTotal = (billsList) => {
    return billsList.reduce((total, bill) => total + bill.amount, 0);
  };
  
  const upcomingTotal = calculateTotal(upcomingBills);
  const overdueTotal = calculateTotal(overdueBills);
  const paidTotal = calculateTotal(paidBills);
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Bill Reminders</h1>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-500">Due This Week</h2>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                {thisWeekBills.length} bills
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-gray-900">{formatCurrency(calculateTotal(thisWeekBills))}</span>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-500">Due This Month</h2>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                {thisMonthBills.length} bills
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-gray-900">{formatCurrency(calculateTotal(thisMonthBills))}</span>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-500">Overdue</h2>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                {overdueBills.length} bills
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-gray-900">{formatCurrency(overdueTotal)}</span>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bills Tabs */}
      <Tabs 
        defaultValue="upcoming" 
        value={tab} 
        onValueChange={setTab}
        className="mb-6"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">
            Upcoming 
            <Badge className="ml-2 bg-blue-100 text-blue-800 border-0">{upcomingBills.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            <Badge className="ml-2 bg-red-100 text-red-800 border-0">{overdueBills.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid
            <Badge className="ml-2 bg-green-100 text-green-800 border-0">{paidBills.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <BillReminders 
            bills={upcomingBills}
            onAddBill={handleAddBill}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </TabsContent>
        
        <TabsContent value="overdue">
          {overdueBills.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-red-600">Overdue Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overdueBills.map((bill) => (
                    <div key={bill.id} className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <CalendarIcon className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{bill.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-red-500">
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
                          <span className="text-xs text-red-500">
                            Overdue
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-xs px-2"
                            onClick={() => handleMarkAsPaid(bill.id)}
                          >
                            Mark Paid
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No overdue bills</h3>
              <p className="text-gray-500">You&apos;re all caught up!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="paid">
          {paidBills.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Paid Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paidBills.map((bill) => (
                    <div key={bill.id} className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{bill.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
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
                        <span className="text-xs text-green-500 mt-1">
                          Paid
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <CalendarIcon className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No paid bills</h3>
              <p className="text-gray-500">Bills you&apos;ve paid will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}