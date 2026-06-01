import { useState } from 'react';
import { useSpecStore } from '@/store/spec-store';
import { toast } from 'sonner';

export interface UseFormSubmitProps {
  method: string;
  resolvedPath: string;
  draftKey: string;
  onSuccess?: (data: unknown) => void;
}

export const getHeaders = (env: { authType?: string; authValue?: string; authHeader?: string }, formData: Record<string, unknown>) => {
  const headers: Record<string, string> = {};
  if (Object.keys(formData).length > 0) headers['Content-Type'] = 'application/json';
  if (env.authType === 'bearer' && env.authValue) headers['Authorization'] = `Bearer ${env.authValue}`;
  else if (env.authType === 'apiKey' && env.authValue) headers[env.authHeader ?? 'X-API-Key'] = env.authValue;
  else if (env.authType === 'basic' && env.authValue) {
    try {
      headers['Authorization'] = `Basic ${btoa(unescape(encodeURIComponent(env.authValue)))}`;
    } catch {
      try {
        headers['Authorization'] = `Basic ${btoa(env.authValue)}`;
      } catch {
        headers['Authorization'] = `Basic ${env.authValue}`;
      }
    }
  }
  return headers;
};

export const createFetchCode = (baseUrl: string, resolvedPath: string, method: string, headers: Record<string, string>, formData: Record<string, unknown>) => {
  const bodyStr = Object.keys(formData).length > 0 ? JSON.stringify(formData, null, 2) : '';
  const headersStr = JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ');
  const bodyPart = bodyStr ? `,\n  body: JSON.stringify(${bodyStr.replace(/\n/g, '\n  ')})` : '';
  return `fetch('${baseUrl}${resolvedPath}', {\n  method: '${method.toUpperCase()}',\n  headers: ${headersStr}${bodyPart}\n});`;
};

const handleResponse = (res: Response, result: unknown, method: string, resolvedPath: string, draftKey: string, setResponse: (r: unknown) => void, setShowResponse: (s: boolean) => void, onSuccess?: (data: unknown) => void) => {
  setResponse(result);
  setShowResponse(true);
  if (res.ok) {
    toast.success(`${method.toUpperCase()} ${resolvedPath} – ${res.status}`);
    onSuccess?.(result);
    try { localStorage.removeItem(draftKey); } catch {}
  } else {
    const details = typeof result === 'object' && result !== null && 'error' in result ? String((result as { error?: unknown }).error) : '';
    toast.error(`${method.toUpperCase()} ${resolvedPath} – ${details ? `${res.status}: ${details}` : `${res.status} ${res.statusText || ''}`}`);
  }
};

export function useFormSubmit({ method, resolvedPath, draftKey, onSuccess }: UseFormSubmitProps) {
  const [response, setResponse] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const { getActiveEnvironment } = useSpecStore();

  const copyAsFetch = (formData: Record<string, unknown>) => {
    const env = getActiveEnvironment();
    if (!env?.baseUrl) return toast.error('No base URL configured.');
    if (!navigator.clipboard) return toast.error('Clipboard API not available');
    try {
      const fetchCode = createFetchCode(env.baseUrl, resolvedPath, method, getHeaders(env, formData), formData);
      navigator.clipboard.writeText(fetchCode)
        .then(() => toast.success('Fetch code copied to clipboard'))
        .catch(() => toast.error('Failed to copy code to clipboard'));
    } catch {
      toast.error('Failed to generate or copy fetch code');
    }
  };

  const handleSubmit = async (e: React.FormEvent, formData: Record<string, unknown>) => {
    e.preventDefault();
    const env = getActiveEnvironment();
    if (!env?.baseUrl) return toast.error('No base URL configured. Set one in Environment settings.');
    setIsLoading(true);
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `${env.baseUrl}${resolvedPath}`,
          method: method.toUpperCase(),
          headers: getHeaders(env, formData),
          body: Object.keys(formData).length > 0 ? formData : undefined,
        }),
      });
      
      const text = await res.text();
      let parsedData: unknown;
      try {
        parsedData = text ? JSON.parse(text) : { success: true };
      } catch {
        parsedData = { error: text || 'Invalid JSON response' };
      }

      handleResponse(res, parsedData, method, resolvedPath, draftKey, setResponse, setShowResponse, onSuccess);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { response, isLoading, showResponse, setShowResponse, handleSubmit, copyAsFetch };
}
