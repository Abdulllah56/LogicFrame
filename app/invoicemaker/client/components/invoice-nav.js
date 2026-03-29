"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Home, LayoutDashboard, FileText, Plus } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export default function InvoiceNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    {
      href: "/invoicemaker",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/invoicemaker/invoices",
      label: "Invoices",
      icon: FileText,
    },
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
  ];

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const isActive = (href) => {
    if (href === "/invoicemaker") {
      return pathname === href;
    }
    return pathname?.startsWith(href) && href !== "/";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-foreground">
              LogicFrame
            </div>
            <div className="h-5 w-px bg-border" />
            <div className="text-sm text-muted-foreground">
              InvoiceMaker
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 border-primary/50 text-primary hover:bg-primary/10"
              asChild
            >
              <Link href="/invoicemaker/invoices/new">
                <Plus className="h-4 w-4" />
                New Invoice
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {mounted && (
                theme === "dark" ? (
                  <Sun className="h-4 w-4 text-foreground" />
                ) : (
                  <Moon className="h-4 w-4 text-foreground" />
                )
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
