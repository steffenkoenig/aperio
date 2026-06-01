import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ViewSaveDialogContentProps {
  newViewName: string;
  setNewViewName: (name: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ViewSaveDialogContent({
  newViewName,
  setNewViewName,
  onCancel,
  onSave,
}: ViewSaveDialogContentProps) {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Save Current View</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="view-name" className="text-right text-sm font-medium">Name</label>
          <Input
            id="view-name"
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            placeholder="e.g. Active Users"
            className="col-span-3 h-8"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" disabled={!newViewName.trim()} onClick={onSave}>Save</Button>
      </div>
    </DialogContent>
  );
}
