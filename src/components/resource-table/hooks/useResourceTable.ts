import { useState, useEffect, useCallback } from 'react';
import { useSpecStore } from '@/store/spec-store';
import { toast } from 'sonner';
import { SortingState } from '@tanstack/react-table';

export interface UseResourceTableProps {
  resolvedPath: string;
  missingParams: string[];
}

export function useResourceTable({ resolvedPath, missingParams }: UseResourceTableProps) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { getActiveEnvironment } = useSpecStore();

  const fetchData = useCallback(async () => {
    const env = getActiveEnvironment();
    if (!env?.baseUrl) {
      setError('No base URL configured. Set one in Environment settings.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {};
      if (env.authType === 'bearer' && env.authValue) {
        headers['Authorization'] = `Bearer ${env.authValue}`;
      } else if (env.authType === 'apiKey' && env.authValue) {
        headers[env.authHeader ?? 'X-API-Key'] = env.authValue;
      } else if (env.authType === 'basic' && env.authValue) {
        headers['Authorization'] = `Basic ${btoa(env.authValue)}`;
      }

      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `${env.baseUrl}${resolvedPath}`,
          method: 'GET',
          headers,
        }),
      });

      const result = await res.json() as unknown;
      const records = Array.isArray(result)
        ? (result as Record<string, unknown>[])
        : typeof result === 'object' && result !== null
          ? (Object.values(result as Record<string, unknown>).find(Array.isArray) as Record<string, unknown>[] | undefined) ?? [result as Record<string, unknown>]
          : [];

      setData(records);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [resolvedPath, getActiveEnvironment]);

  useEffect(() => {
    if (missingParams.length === 0) {
      void fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedPath]);

  return {
    data,
    isLoading,
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    error,
    fetchData,
  };
}
