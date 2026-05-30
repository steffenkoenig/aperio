import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseResourceDraftProps {
  draftKey: string;
}

export function useResourceDraft({ draftKey }: UseResourceDraftProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Load draft on mount using a slight delay to avoid synchronous state updates
    // inside useEffect which trigger 'cascading renders' lint error
    const timer = setTimeout(() => {
      try {
        const draft = localStorage.getItem(draftKey);
        if (draft) {
          setFormData(JSON.parse(draft));
          toast('Draft restored', {
            description: 'Your previous form data has been loaded.',
            duration: 3000,
          });
        }
      } catch {
        // Ignore local storage errors
      }
      setIsDraftLoaded(true);
      mountedRef.current = true;
    }, 0);

    return () => clearTimeout(timer);
  }, [draftKey]);

  useEffect(() => {
    if (!mountedRef.current || !isDraftLoaded) return;

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
  }, [formData, isDraftLoaded, draftKey]);

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
