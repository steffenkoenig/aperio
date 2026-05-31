import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useDraft(draftKey: string) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    // Only load from localStorage once per draftKey
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    // Load draft on mount (defer to avoid synchronous setState cascading render warning)
    const timer = setTimeout(() => {
      try {
        const draft = localStorage.getItem(draftKey);
        if (draft) {
          setFormData(JSON.parse(draft) as Record<string, unknown>);
          toast('Draft restored', {
            description: 'Your previous form data has been loaded.',
            duration: 3000,
          });
        }
      } catch {
        // Ignore local storage errors
      }
      setIsDraftLoaded(true);
    }, 0);

    return () => {
      clearTimeout(timer);
      initialLoadRef.current = false; // Reset on unmount for Strict Mode
    };
  }, [draftKey]);

  useEffect(() => {
    if (!isDraftLoaded) return;

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

  return { formData, setFormData, handleDiscardDraft, clearDraft };
}
