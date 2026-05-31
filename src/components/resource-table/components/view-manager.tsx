import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { SortingState, VisibilityState } from '@tanstack/react-table';
import { ResourceTableViewSaveDialog } from './view-save-dialog';
import { ResourceTableViewDropdown } from './view-dropdown';
import { useResourceTableView } from '../hooks/useResourceTableView';

export interface ResourceTableViewManagerProps {
  path: string;
  globalFilter: string;
  sorting: SortingState;
  columnVisibility: VisibilityState;
  setSorting: (sorting: SortingState) => void;
  setGlobalFilter: (filter: string) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  activeViewId: string;
  setActiveViewId: (id: string) => void;
}

export function ResourceTableViewManager({
  path,
  globalFilter,
  sorting,
  columnVisibility,
  setSorting,
  setGlobalFilter,
  setColumnVisibility,
  activeViewId,
  setActiveViewId,
}: ResourceTableViewManagerProps) {
  const {
    saveDialogOpen, setSaveDialogOpen,
    newViewName, setNewViewName,
    savedViewsForPath,
    handleSelectView,
    handleDeleteView,
  } = useResourceTableView(path, activeViewId, setActiveViewId, setSorting, setGlobalFilter, setColumnVisibility);

  return (
    <div className="flex items-center gap-2">
      <ResourceTableViewDropdown
        activeViewId={activeViewId}
        savedViewsForPath={savedViewsForPath}
        handleSelectView={handleSelectView}
      />

      <ResourceTableViewSaveDialog
        path={path} globalFilter={globalFilter} sorting={sorting} columnVisibility={columnVisibility}
        setActiveViewId={setActiveViewId} saveDialogOpen={saveDialogOpen} setSaveDialogOpen={setSaveDialogOpen}
        newViewName={newViewName} setNewViewName={setNewViewName}
      />

      {activeViewId !== 'default' && (
        <Button
          size="sm" variant="ghost"
          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDeleteView}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
