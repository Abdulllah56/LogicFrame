"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, UserCircleIcon, MenuIcon } from "lucide-react";
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
    <header className="bg-white shadow-sm z-10 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex items-center">
            <Link href="/FinanceFriend">
              <span className="text-[#0F172A] font-extrabold text-xl cursor-pointer select-none">
                Finance<span className="text-blue-600">Friend</span>
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex flex-grow justify-center">
            <ul className="flex space-x-8">
              <li>
                <Link 
                  href="/FinanceFriend/dashboard"
                  className={`text-base font-medium transition-colors ${pathname === '/FinanceFriend/dashboard' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/FinanceFriend/expenses"
                  className={`text-base font-medium transition-colors ${pathname === '/FinanceFriend/expenses' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Expenses
                </Link>
              </li>
              <li>
                <Link 
                  href="/FinanceFriend/bills"
                  className={`text-base font-medium transition-colors ${pathname === '/FinanceFriend/bills' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Bills
                </Link>
              </li>
              <li>
                <Link 
                  href="/FinanceFriend/goals"
                  className={`text-base font-medium transition-colors ${pathname === '/FinanceFriend/goals' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Goals
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <BellIcon className="h-5 w-5 text-gray-600" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm shadow-md">
                    JS
                  </div>
                  <span className="text-sm font-medium text-gray-700">Jamie Smith</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden rounded-md">
            <MenuIcon className="h-6 w-6 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}