import { useSpecStore } from '@/store/spec-store';
import { useDraft } from './use-draft';
import { useFormSubmit } from './use-form-submit';

export interface UseResourceFormProps {
  path: string;
  method: string;
  resolvedPath: string;
  onSuccess?: (data: unknown) => void;
}

export function useResourceForm({ path, method, resolvedPath, onSuccess }: UseResourceFormProps) {
  const { parsedSpec } = useSpecStore();
  const draftKey = `draft_${parsedSpec?.title ?? 'default'}_${method.toUpperCase()}_${path}`;

  const { formData, setFormData, handleDiscardDraft, clearDraft } = useDraft(draftKey);

  const {
    response,
    isLoading,
    showResponse,
    setShowResponse,
    handleSubmit: baseHandleSubmit,
    copyAsFetch: baseCopyAsFetch
  } = useFormSubmit({
    method,
    resolvedPath,
    draftKey,
    onSuccess: (data) => {
      clearDraft();
      onSuccess?.(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => baseHandleSubmit(e, formData);
  const copyAsFetch = () => baseCopyAsFetch(formData);

  return {
    formData,
    setFormData,
    response,
    isLoading,
    showResponse,
    setShowResponse,
    handleDiscardDraft,
    clearDraft,
    handleSubmit,
    copyAsFetch
  };
}
