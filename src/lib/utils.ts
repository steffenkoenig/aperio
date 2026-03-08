import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert a resource path to its dashboard slug */
export function pathToSlug(path: string): string {
  return path.replace(/\//g, '_').replace(/[{}]/g, '').replace(/^_/, '');
}
