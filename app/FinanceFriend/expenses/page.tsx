"use client"

import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../client/lib/queryClient";
import { TooltipProvider } from "../components/ui/tooltip";
import { Toaster } from "../components/ui/toaster";
import Header from "../components/layout/Header";
import MobileNavigation from "../components/layout/MobileNavigation";
import { useExpenses } from "../client/lib/hooks/useExpenses";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AddExpenseDialog } from "../components/expenses/AddExpenseDialog";
import { PlusIcon, SearchIcon, FilterIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { formatCurrency } from "../client/lib/utils/date-utils";
import { useToast } from "../client/hooks/use-toast";

export default function Expenses() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  
  const { data: expenses, isLoading: expensesLoading, deleteExpense } = useExpenses();
  const { data: categories } = useExpenses("/api/categories");
  const { toast } = useToast();
  
  // Filtered and sorted expenses
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);
  
  // Update filtered expenses when data changes
  useEffect(() => {
    if (expenses && categories) {
      let result = [...expenses];
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(expense => 
          expense.description.toLowerCase().includes(term)
        );
      }
      
      // Filter by category
      if (selectedCategory !== "all") {
        result = result.filter(expense => 
          expense.categoryId === parseInt(selectedCategory)
        );
      }
      
      // Sort expenses
      if (selectedSort === "newest") {
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else if (selectedSort === "oldest") {
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else if (selectedSort === "highest") {
        result.sort((a, b) => b.amount - a.amount);
      } else if (selectedSort === "lowest") {
        result.sort((a, b) => a.amount - b.amount);
      }
      
      setFilteredExpenses(result);
    }
  }, [expenses, categories, searchTerm, selectedCategory, selectedSort]);
  
  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (expenseToDelete) {
      try {
        await deleteExpense(expenseToDelete);
        toast({
          title: "Expense deleted",
          description: "The expense has been deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete the expense. Please try again.",
          variant: "destructive",
        });
      } finally {
        setShowConfirmDelete(false);
        setExpenseToDelete(null);
      }
    }
  };
  
  // Handler for delete button
  const handleDeleteClick = (id: number) => {
    setExpenseToDelete(id);
    setShowConfirmDelete(true);
  };
  
  // Group expenses by date
  const groupExpensesByDate = (expenses: any[]) => {
    const grouped = new Map();
    
    expenses.forEach(expense => {
      const date = format(new Date(expense.date), "yyyy-MM-dd");
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date).push(expense);
    });
    
    // Convert Map to array of [date, expenses] pairs and sort by date (most recent first)
    return Array.from(grouped.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, expenseList]) => ({
        date,
        expenses: expenseList,
      }));
  };
  
  const groupedExpenses = groupExpensesByDate(filteredExpenses);
  
  // Calculate totals
  const calculateTotalForGroup = (expenses: any[]) => {
    return expenses.reduce((sum, expense) => {
      const category = categories?.find(c => c.id === expense.categoryId);
      if (category?.name === "Income") {
        return sum;
      }
      return sum + expense.amount;
    }, 0);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Expenses</h1>
        <Button 
          className="bg-[#0F172A] text-white hover:bg-[#1E293B] flex items-center space-x-2"
          onClick={() => setShowAddExpense(true)}
        >
          <PlusIcon size={16} />
          <span>Add Expense</span>
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search expenses..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedSort}
            onValueChange={setSelectedSort}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Amount</SelectItem>
              <SelectItem value="lowest">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Expenses List */}
      {expensesLoading ? (
        <div className="flex justify-center py-12">
          <p>Loading expenses...</p>
        </div>
      ) : (
        <>
          {groupedExpenses.length > 0 ? (
            <div className="space-y-6">
              {groupedExpenses.map(group => (
                <Card key={group.date}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-medium">
                        {format(new Date(group.date), "EEEE, MMMM d, yyyy")}
                      </CardTitle>
                      <span className="text-sm font-medium">
                        Total: {formatCurrency(calculateTotalForGroup(group.expenses))}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      {group.expenses.map((expense: any) => {
                        const category = categories?.find(c => c.id === expense.categoryId);
                        const isIncome = category?.name === "Income";
                        
                        return (
                          <div key={expense.id} className="py-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-10 w-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${category?.color}20` }}
                              >
                                <i className={`${category?.icon} text-${category?.color.substring(1)}`}></i>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{expense.description || "Untitled Expense"}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                    {category?.name || "Other"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(expense.date), "h:mm a")}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                {isIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-red-500"
                                onClick={() => handleDeleteClick(expense.id)}
                              >
                                <TrashIcon size={16} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <FilterIcon className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your filters" 
                  : "Start tracking your expenses"}
              </p>
              <Button onClick={() => setShowAddExpense(true)}>Add Your First Expense</Button>
            </div>
          )}
        </>
      )}
      
      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
      />
      
      {/* Confirm Delete Dialog */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
