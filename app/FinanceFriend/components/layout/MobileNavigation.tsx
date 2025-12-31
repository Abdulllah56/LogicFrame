import { Link } from 'wouter';
import {
  HomeIcon,
  BarChart3Icon,
  PlusCircleIcon,
  CalendarClockIcon,
  UserIcon
} from 'lucide-react';
import { AddExpenseDialog } from '../expenses/AddExpenseDialog';
import { useState } from 'react';

interface MobileNavigationProps {
  currentPath: string;
}

export default function MobileNavigation({ currentPath }: MobileNavigationProps) {
  const [showAddExpense, setShowAddExpense] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white/[0.02] backdrop-blur-md border-t border-border md:hidden z-10">
        <div className="flex justify-around">
          <Link href="/dashboard">
            <button className={`p-4 flex flex-col items-center transition-colors ${currentPath === '/dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
              <HomeIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </button>
          </Link>

          <Link href="/expenses">
            <button className={`p-4 flex flex-col items-center transition-colors ${currentPath === '/expenses' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
              <BarChart3Icon className="h-5 w-5" />
              <span className="text-xs mt-1">Analytics</span>
            </button>
          </Link>

          <button
            className="p-4 flex flex-col items-center text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setShowAddExpense(true)}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Add</span>
          </button>

          <Link href="/bills">
            <button className={`p-4 flex flex-col items-center transition-colors ${currentPath === '/bills' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
              <CalendarClockIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Bills</span>
            </button>
          </Link>

          <Link href="/goals">
            <button className={`p-4 flex flex-col items-center transition-colors ${currentPath === '/goals' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
              <UserIcon className="h-5 w-5" />
              <span className="text-xs mt-1">Goals</span>
            </button>
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
