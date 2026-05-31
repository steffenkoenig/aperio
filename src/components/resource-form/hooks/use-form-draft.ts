import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseFormDraftProps {
  draftKey: string;
}

export function useFormDraft({ draftKey }: UseFormDraftProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Defer the hydration to avoid cascading renders inside the effect body
    setTimeout(() => {
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
    }, 0);
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
        // Ignore local storage errors
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
