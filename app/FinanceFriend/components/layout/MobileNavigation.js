"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, BarChart3Icon, PlusCircleIcon, CalendarClockIcon, UserIcon } from "lucide-react";
import { AddExpenseDialog } from "../expenses/AddExpenseDialog";

export default function MobileNavigation() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const pathname = usePathname();
  
  const getLinkClasses = (path) => 
    `p-3 flex flex-col items-center justify-center transition-colors ${
      pathname === path 
        ? "text-blue-600"
        : "text-gray-500 hover:text-blue-500"
    }`;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="flex justify-around items-stretch h-16">
          
          <Link href="/FinanceFriend/dashboard" className={getLinkClasses("/FinanceFriend/dashboard")}>
            <HomeIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link href="/FinanceFriend/expenses" className={getLinkClasses("/FinanceFriend/expenses")}>
            <BarChart3Icon className="h-5 w-5" />
            <span className="text-xs mt-1">Analytics</span>
          </Link>
          
          <div className="flex items-center justify-center -translate-y-2">
            <button 
              className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl flex flex-col items-center justify-center hover:bg-blue-700 transition-transform duration-200 transform hover:scale-105"
              onClick={() => setShowAddExpense(true)}
              aria-label="Add new expense"
            >
              <PlusCircleIcon className="h-7 w-7" />
            </button>
          </div>

          <Link href="/FinanceFriend/bills" className={getLinkClasses("/FinanceFriend/bills")}>
            <CalendarClockIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Bills</span>
          </Link>
          
          <Link href="/FinanceFriend/goals" className={getLinkClasses("/FinanceFriend/goals")}>
            <UserIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Goals</span>
          </Link>
        </div>
      </div>
      
      <AddExpenseDialog 
        open={showAddExpense} 
        onOpenChange={setShowAddExpense} 
      />
    </>
  );
}