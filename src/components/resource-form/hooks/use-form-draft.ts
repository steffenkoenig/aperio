import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { OpenApiSpec } from '@/lib/types';

export function useFormDraft(parsedSpec: OpenApiSpec | null, method: string, path: string) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const isInitialized = useRef(false);

  const draftKey = `draft_${parsedSpec?.info?.title ?? 'default'}_${method.toUpperCase()}_${path}`;

  useEffect(() => {
    if (isInitialized.current) return;

    // Load draft on mount
    try {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        // We use a timeout to avoid synchronous setState inside effect
        setTimeout(() => {
          setFormData(JSON.parse(draft) as Record<string, unknown>);
          toast('Draft restored', {
            description: 'Your previous form data has been loaded.',
            duration: 3000,
          });
        }, 0);
      }
    } catch {
      // Ignore local storage errors
    }
    isInitialized.current = true;
  }, [draftKey]);

  useEffect(() => {
    if (!isInitialized.current) return;

    const handler = setTimeout(() => {
      try {
        if (Object.keys(formData).length > 0) {
          localStorage.setItem(draftKey, JSON.stringify(formData));
        } else {
          localStorage.removeItem(draftKey);
        }
      } catch {
        // Ignore local storage errors (quota exceeded, etc)
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [formData, draftKey]);

  const handleDiscardDraft = () => {
    setFormData({});
    try {
      localStorage.removeItem(draftKey);
    } catch {}
    toast.success('Draft discarded');
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch {}
  };

  return {
    formData,
    setFormData,
    handleDiscardDraft,
    clearDraft,
  };
}
