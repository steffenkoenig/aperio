'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpecStore } from '@/store/spec-store';
import { SidebarNav } from '@/components/sidebar-nav';
import { EnvironmentSwitcher } from '@/components/environment-switcher';
import { Button } from '@/components/ui/button';
import { LogOut, ExternalLink, Search } from 'lucide-react';
import { CommandPalette } from '@/components/command-palette';
import { BookmarksPanel } from '@/components/bookmarks-panel';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { parsedSpec, clearSpec } = useSpecStore();

  useEffect(() => {
    if (!parsedSpec) {
      router.push('/');
    }
  }, [parsedSpec, router]);

  if (!parsedSpec) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav nodes={parsedSpec.resourceTree} specTitle={parsedSpec.title} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b flex items-center justify-between px-4 bg-background flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">{parsedSpec.title}</span>
            <span className="text-xs text-muted-foreground/60">v{parsedSpec.version}</span>
            {parsedSpec.baseUrl && (
              <a
                href={parsedSpec.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {parsedSpec.baseUrl}
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs text-muted-foreground gap-2 hidden md:flex"
              onClick={() => {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
              }}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <BookmarksPanel />
            <EnvironmentSwitcher />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              onClick={() => { clearSpec(); router.push('/'); }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Change Spec
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
