import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Rounded percentage of `part` in `total`; 0 when `total` is 0 (avoids NaN/Infinity on empty data). */
export function percentOf(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

/** Rounded average of a list; 0 when the list is empty. */
export function averageOf(values: number[]): number {
  return values.length > 0 ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) : 0
}
