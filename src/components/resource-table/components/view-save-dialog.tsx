import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Save } from 'lucide-react';
import { SortingState, VisibilityState } from '@tanstack/react-table';
import { useSpecStore } from '@/store/spec-store';
import { toast } from 'sonner';
import { ViewSaveDialogContent } from './view-save-dialog-content';

interface ResourceTableViewSaveDialogProps {
  path: string;
  globalFilter: string;
  sorting: SortingState;
  columnVisibility: VisibilityState;
  setActiveViewId: (id: string) => void;
  saveDialogOpen: boolean;
  setSaveDialogOpen: (open: boolean) => void;
  newViewName: string;
  setNewViewName: (name: string) => void;
}

export function ResourceTableViewSaveDialog({
  path,
  globalFilter,
  sorting,
  columnVisibility,
  setActiveViewId,
  saveDialogOpen,
  setSaveDialogOpen,
  newViewName,
  setNewViewName,
}: ResourceTableViewSaveDialogProps) {
  const { saveView } = useSpecStore();

  const handleSave = () => {
    const id = crypto.randomUUID();
    saveView({
      id,
      name: newViewName.trim(),
      resourcePath: path,
      globalFilter,
      sorting: sorting as { id: string; desc: boolean }[],
      columnVisibility
    });
    setActiveViewId(id);
    setSaveDialogOpen(false);
    setNewViewName('');
    toast.success('View saved');
  };

  return (
    <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
          <Save className="h-3 w-3" /> Save View
        </Button>
      </DialogTrigger>
      <ViewSaveDialogContent
        newViewName={newViewName}
        setNewViewName={setNewViewName}
        onCancel={() => setSaveDialogOpen(false)}
        onSave={handleSave}
      />
    </Dialog>
  );
}
