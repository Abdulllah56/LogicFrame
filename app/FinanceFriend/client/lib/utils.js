import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines Tailwind CSS class strings using clsx and twMerge.
 * It resolves conflicts by preferring the last class value.
 *
 * @param {...(string | string[] | { [key: string]: boolean })} inputs
 * @returns {string} The merged Tailwind class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}