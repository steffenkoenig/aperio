import { useState } from 'react';
import { toast } from 'sonner';

export function useResourceSubmit(
  getActiveEnvironment: () => { baseUrl?: string; authType?: string; authValue?: string; authHeader?: string } | null,
  method: string,
  resolvedPath: string,
  formData: Record<string, unknown>,
  onSuccess?: (data: unknown) => void,
  clearDraft?: () => void
) {
  const [response, setResponse] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        clearDraft?.();
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

  const copyAsFetch = () => {
    const env = getActiveEnvironment();
    if (!env?.baseUrl) {
      toast.error('No base URL configured.');
      return;
    }

    const headers: Record<string, string> = {};
    const hasBody = Object.keys(formData).length > 0;
    if (hasBody) {
      headers['Content-Type'] = 'application/json';
    }

    if (env.authType === 'bearer' && env.authValue) {
      headers['Authorization'] = `Bearer ${env.authValue}`;
    } else if (env.authType === 'apiKey' && env.authValue) {
      headers[env.authHeader ?? 'X-API-Key'] = env.authValue;
    } else if (env.authType === 'basic' && env.authValue) {
      headers['Authorization'] = `Basic ${btoa(env.authValue)}`;
    }

    const options: RequestInit = {
      method: method.toUpperCase(),
      headers,
    };

    let bodyStr = '';
    if (hasBody) {
      bodyStr = JSON.stringify(formData, null, 2);
      options.body = bodyStr;
    }

    const fetchCode = `fetch('${env.baseUrl}${resolvedPath}', {\n  method: '${options.method}',\n  headers: ${JSON.stringify(options.headers, null, 2).replace(/\n/g, '\n  ')}${bodyStr ? `,\n  body: JSON.stringify(${bodyStr.replace(/\n/g, '\n  ')})` : ''}\n});`;

    if (!navigator.clipboard) {
      toast.error('Clipboard API not available in this browser/context');
      return;
    }

    navigator.clipboard.writeText(fetchCode).then(() => {
      toast.success('Fetch code copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy code to clipboard');
    });
  };

  return {
    response,
    setResponse,
    isLoading,
    showResponse,
    setShowResponse,
    handleSubmit,
    copyAsFetch,
  };
}
