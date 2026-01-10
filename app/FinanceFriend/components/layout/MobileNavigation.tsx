"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BarChart3Icon,
  PlusCircleIcon,
  CalendarClockIcon,
  UserIcon
} from 'lucide-react';
import { AddExpenseDialog } from '../expenses/AddExpenseDialog';
import { useState } from 'react';

export default function MobileNavigation() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const currentPath = usePathname();

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white/[0.02] backdrop-blur-md border-t border-border md:hidden z-10">
        <div className="flex justify-around">
          <Link
            href="/FinanceFriend/dashboard"
            className={`p-4 flex flex-col items-center transition-colors ${currentPath === '/FinanceFriend/dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            href="/FinanceFriend/expenses"
            className={`p-4 flex flex-col items-center transition-colors ${currentPath === '/FinanceFriend/expenses' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            <BarChart3Icon className="h-5 w-5" />
            <span className="text-xs mt-1">Analytics</span>
          </Link>

          <button
            className="p-4 flex flex-col items-center text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setShowAddExpense(true)}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Add</span>
          </button>

          <Link
            href="/FinanceFriend/bills"
            className={`p-4 flex flex-col items-center transition-colors ${currentPath === '/FinanceFriend/bills' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            <CalendarClockIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Bills</span>
          </Link>

          <Link
            href="/FinanceFriend/goals"
            className={`p-4 flex flex-col items-center transition-colors ${currentPath === '/FinanceFriend/goals' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
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
