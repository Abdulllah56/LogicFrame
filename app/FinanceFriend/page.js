"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./client/lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import LandingPage from "./landing/page";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <LandingPage />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}