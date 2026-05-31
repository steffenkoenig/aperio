'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSpecStore } from '@/store/spec-store';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkMinus, Play, TableProperties, TextSelect } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function BookmarksPanel() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { bookmarks, removeBookmark, setActiveBookmark } = useSpecStore();

  const handleApply = (bookmark: typeof bookmarks[0]) => {
    setActiveBookmark(bookmark);
    setOpen(false);
    router.push(`/dashboard/resource/${encodeURIComponent(bookmark.slug)}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5">
          <Bookmark className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Bookmarks</span>
          {bookmarks.length > 0 && (
            <Badge variant="secondary" className="ml-0.5 px-1 py-0 text-[9px]">
              {bookmarks.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            Saved Bookmarks
          </SheetTitle>
          <SheetDescription>
            Quickly access your saved forms and table views.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center space-y-3 text-muted-foreground">
              <Bookmark className="h-8 w-8 opacity-20" />
              <p className="text-sm">No bookmarks saved yet.</p>
            </div>
          ) : (
            bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="border rounded-lg p-3 flex flex-col gap-2 hover:bg-muted/10 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {bookmark.type === 'form' ? (
                      <TextSelect className="h-4 w-4 text-muted-foreground mt-0.5" />
                    ) : (
                      <TableProperties className="h-4 w-4 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-sm font-semibold">{bookmark.name}</h4>
                      <code className="text-xs text-muted-foreground line-clamp-1">{bookmark.path}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {bookmark.method && (
                      <Badge variant="outline" className="text-[10px] uppercase font-mono px-1 py-0">
                        {bookmark.method}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted/50">
                  <div className="text-xs text-muted-foreground flex gap-3">
                    {Object.keys(bookmark.pathParams).length > 0 && (
                      <span>{Object.keys(bookmark.pathParams).length} Path Params</span>
                    )}
                    {bookmark.globalFilter && (
                      <span>Filtered: &quot;{bookmark.globalFilter}&quot;</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeBookmark(bookmark.id)}
                    >
                      <BookmarkMinus className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-[10px] px-3"
                      onClick={() => handleApply(bookmark)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
