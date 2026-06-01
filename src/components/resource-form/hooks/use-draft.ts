import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function useDraft(draftKey: string) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [prevDraftKey, setPrevDraftKey] = useState(draftKey);

  if (draftKey !== prevDraftKey) {
    setFormData({});
    setIsDraftLoaded(false);
    setPrevDraftKey(draftKey);
  }

  useEffect(() => {
    // Force re-evaluation of localStorage when key changes
    const timer = setTimeout(() => {
      try {
        const draft = localStorage.getItem(draftKey);
        if (draft) {
          setFormData(JSON.parse(draft) as Record<string, unknown>);
          toast('Draft restored', { description: 'Your previous form data has been loaded.', duration: 3000 });
        }
      } catch {}
      setIsDraftLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
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
      } catch {}
    }, 500);
    return () => clearTimeout(handler);
  }, [formData, isDraftLoaded, draftKey]);

  const handleDiscardDraft = () => {
    setFormData({});
    try { localStorage.removeItem(draftKey); } catch {}
    toast.success('Draft discarded');
  };

  return { formData, setFormData, handleDiscardDraft };
}
