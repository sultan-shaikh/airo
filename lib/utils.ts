import clsx, { ClassValue } from 'clsx'

/** Thin wrapper around clsx so components have a single conditional-class helper. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs)
}
