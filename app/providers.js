"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "./invoicemaker/client/hooks/useToast";
import { ThemeProvider } from "./invoicemaker/client/components/theme-provider";

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="logicframe-theme">
        {children}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}