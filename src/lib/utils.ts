import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert a resource path to its dashboard slug */
export function pathToSlug(path: string): string {
  return path.replace(/\//g, '_').replace(/[{}]/g, '').replace(/^_/, '');
}

/** Extract path parameter names from an OpenAPI path template, e.g. `/users/{id}` → `['id']` */
export function extractPathParamNames(path: string): string[] {
  return [...path.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
}
