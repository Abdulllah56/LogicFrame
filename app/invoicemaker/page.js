"use client";

import React from "react";
import { InvoiceGenerator } from "./client/components/invoice-generator";
import { ThemeProvider } from "./client/components/theme-provider";
import Dashboard from "./dashboard/page"
import "../globals.css";

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <main className="min-h-screen bg-background text-foreground p-4">
        <div className="container mx-auto max-w-6xl">
          <Dashboard />
          {/* <InvoiceGenerator /> */}
        </div>
      </main>
    </ThemeProvider>
  );
}
