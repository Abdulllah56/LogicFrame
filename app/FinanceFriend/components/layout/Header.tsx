"use client"

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BellIcon,
  UserCircleIcon
} from 'lucide-react';
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white/[0.02] backdrop-blur-md border-b border-border shadow-sm z-10 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/FinanceFriend2" className="text-foreground font-semibold text-xl cursor-pointer">
              Finance<span className="text-primary">Friend</span>
            </Link>
          </div>

          <nav className="hidden md:flex flex-grow justify-center">
            <ul className="flex space-x-8">
              <li>
                <Link href="/FinanceFriend/dashboard" className={`text-base font-medium transition-colors ${pathname === '/FinanceFriend/dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/FinanceFriend/expenses" className={`text-base font-medium transition-colors ${pathname === '/FinanceFriend/expenses' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                  Expenses
                </Link>
              </li>
              <li>
                <Link href="/FinanceFriend/bills" className={`text-base font-medium transition-colors ${pathname === '/FinanceFriend/bills' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                  Bills
                </Link>
              </li>
              <li>
                <Link href="/FinanceFriend/goals" className={`text-base font-medium transition-colors ${pathname === '/FinanceFriend/goals' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                  Goals
                </Link>
              </li>
            </ul>
          </nav>



          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-md hover:bg-white/[0.05]"
          >
            <i className="ri-menu-line text-foreground text-xl"></i>
          </Button>
        </div>
      </div>
    </header>
  );
}
