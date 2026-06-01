import { useState } from 'react';
import { VisibilityState } from '@tanstack/react-table';

export function useResourceTableState() {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [activeViewId, setActiveViewId] = useState<string>('default');

  return {
    columnVisibility,
    setColumnVisibility,
    activeViewId,
    setActiveViewId,
  };
}
