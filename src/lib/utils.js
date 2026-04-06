import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility for merging Tailwind classes with clsx and tailwind-merge.
 * Essential for the new Shadcn-based modern design system.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
