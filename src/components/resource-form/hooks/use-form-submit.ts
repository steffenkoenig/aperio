import { useState } from 'react';
import { toast } from 'sonner';

interface Environment {
  baseUrl: string;
  authType?: string;
  authValue?: string;
  authHeader?: string;
}

interface UseFormSubmitProps {
  method: string;
  resolvedPath: string;
  getActiveEnvironment: () => Environment | undefined;
  onSuccess?: (data: unknown) => void;
  clearDraft: () => void;
}

export function useFormSubmit({ method, resolvedPath, getActiveEnvironment, onSuccess, clearDraft }: UseFormSubmitProps) {
  const [response, setResponse] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const handleSubmit = async (e: React.FormEvent, formData: Record<string, unknown>) => {
    e.preventDefault();
    const env = getActiveEnvironment();
    if (!env?.baseUrl) {
      toast.error('No base URL configured. Set one in Environment settings.');
      return;
    }

    setIsLoading(true);
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
          method: method.toUpperCase(),
          headers,
          body: Object.keys(formData).length > 0 ? formData : undefined,
        }),
      });

      const result = await res.json() as unknown;
      setResponse(result);
      setShowResponse(true);

      if (res.ok) {
        toast.success(`${method.toUpperCase()} ${resolvedPath} – ${res.status}`);
        onSuccess?.(result);
        clearDraft();
      } else {
        const details = typeof result === 'object' && result !== null && 'error' in result ? String((result as Record<string, unknown>).error) : '';
        const msg = details ? `${res.status}: ${details}` : `${res.status} ${res.statusText || ''}`;
        toast.error(`${method.toUpperCase()} ${resolvedPath} – ${msg}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    response,
    isLoading,
    showResponse,
    setShowResponse,
    handleSubmit,
  };
}
