import { useState, ChangeEvent } from 'react';
import { useSpecStore } from '@/store/spec-store';
import { SortingState, VisibilityState } from '@tanstack/react-table';
import { toast } from 'sonner';

export function useResourceTableView(path: string, activeViewId: string, setActiveViewId: (id: string) => void, setSorting: (s: SortingState) => void, setGlobalFilter: (f: string) => void, setColumnVisibility: (v: VisibilityState) => void) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  const { specSource, preferences, deleteView } = useSpecStore();
  const savedViewsForPath = specSource
    ? (preferences[specSource]?.savedViews || []).filter(v => v.resourcePath === path)
    : [];

  const handleSelectView = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setActiveViewId(id);
    if (id === 'default') {
      setSorting([]);
      setGlobalFilter('');
      setColumnVisibility({});
    } else {
      const view = savedViewsForPath.find(v => v.id === id);
      if (view) {
        setSorting(view.sorting as SortingState);
        setGlobalFilter(view.globalFilter);
        setColumnVisibility(view.columnVisibility);
      }
    }
  };

  const handleDeleteView = () => {
    deleteView(activeViewId);
    setActiveViewId('default');
    setSorting([]);
    setGlobalFilter('');
    setColumnVisibility({});
    toast.success('View deleted');
  };

  return {
    saveDialogOpen, setSaveDialogOpen,
    newViewName, setNewViewName,
    savedViewsForPath,
    handleSelectView,
    handleDeleteView,
  };
}
