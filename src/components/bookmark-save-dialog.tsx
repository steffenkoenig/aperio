'use client';

import { useState } from 'react';
import { Bookmark } from '@/lib/types';
import { useSpecStore } from '@/store/spec-store';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookmarkPlus } from 'lucide-react';
import { toast } from 'sonner';

interface BookmarkSaveDialogProps {
  type: 'table' | 'form';
  path: string;
  slug: string;
  method?: string;
  formData?: Record<string, unknown>;
  globalFilter?: string;
}

export function BookmarkSaveDialog({
  type,
  path,
  slug,
  method,
  formData,
  globalFilter,
}: BookmarkSaveDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const { pathParams, addBookmark } = useSpecStore();

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a name for the bookmark.');
      return;
    }

    const newBookmark: Bookmark = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      path,
      slug,
      method,
      pathParams: { ...pathParams },
      formData: formData ? { ...formData } : undefined,
      globalFilter,
    };

    addBookmark(newBookmark);
    toast.success(`Bookmark "${newBookmark.name}" saved.`);
    setOpen(false);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <BookmarkPlus className="h-3.5 w-3.5" />
          <span>Save View</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Bookmark</DialogTitle>
          <DialogDescription>
            Save your current {type === 'form' ? 'form payload' : 'table filters'} and path parameters to quickly access them later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="bookmark-name" className="text-right text-sm font-medium">
              Name
            </label>
            <Input
              id="bookmark-name"
              placeholder="e.g. Test User Payload"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Bookmark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
