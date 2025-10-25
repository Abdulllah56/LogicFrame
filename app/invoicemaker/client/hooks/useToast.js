"use client";

import { useCallback } from "react";
import {
  toast as sonnerToast,
  Toaster as SonnerToaster,
} from "sonner";

export function useToast() {
  const toast = useCallback(
    ({ title, description, ...props }) => {
      sonnerToast(description ? `${title}\n${description}` : title, {
        ...props,
      });
    },
    []
  );

  return { toast };
}

export function Toaster() {
  return <SonnerToaster position="bottom-right" />;
}