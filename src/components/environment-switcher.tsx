'use client';

import { useState } from 'react';
import { useSpecStore } from '@/store/spec-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Plus, Settings, Trash2 } from 'lucide-react';
import { AppEnvironment } from '@/lib/types';
import { cn } from '@/lib/utils';

export function EnvironmentSwitcher() {
  const { environments, activeEnvironmentId, setActiveEnvironment, addEnvironment, removeEnvironment, updateEnvironment } = useSpecStore();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<AppEnvironment | null>(null);

  const active = environments.find((e) => e.id === activeEnvironmentId);

  const handleSaveEnv = () => {
    if (!editingEnv) return;
    if (environments.find((e) => e.id === editingEnv.id)) {
      updateEnvironment(editingEnv.id, editingEnv);
    } else {
      addEnvironment(editingEnv);
    }
    setEditOpen(false);
    setEditingEnv(null);
  };

  const createNew = () => {
    setEditingEnv({
      id: crypto.randomUUID(),
      name: 'New Environment',
      baseUrl: '',
      authType: 'none',
    });
    setEditOpen(true);
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => setOpen(!open)}
        >
          <div className="w-2 h-2 rounded-full bg-green-500" />
          {active?.name ?? 'No Environment'}
          <ChevronDown className="h-3 w-3" />
        </Button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-56 bg-popover border rounded-md shadow-md z-20 p-1">
              {environments.map((env) => (
                <div
                  key={env.id}
                  className={cn(
                    'flex items-center justify-between px-2 py-1.5 rounded text-sm cursor-pointer',
                    env.id === activeEnvironmentId ? 'bg-accent' : 'hover:bg-accent'
                  )}
                  onClick={() => { setActiveEnvironment(env.id); setOpen(false); }}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', env.id === activeEnvironmentId ? 'bg-green-500' : 'bg-muted-foreground/30')} />
                    <span className="truncate">{env.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[9px] px-1 h-4">{env.authType}</Badge>
                    <button
                      className="p-0.5 hover:text-foreground text-muted-foreground"
                      onClick={(e) => { e.stopPropagation(); setEditingEnv(env); setEditOpen(true); setOpen(false); }}
                    >
                      <Settings className="h-3 w-3" />
                    </button>
                    {env.id !== 'default' && (
                      <button
                        className="p-0.5 hover:text-destructive text-muted-foreground"
                        onClick={(e) => { e.stopPropagation(); removeEnvironment(env.id); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="h-px bg-border my-1" />
              <button
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => { createNew(); setOpen(false); }}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Environment
              </button>
            </div>
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEnv && environments.find(e => e.id === editingEnv.id) ? 'Edit' : 'New'} Environment
            </DialogTitle>
          </DialogHeader>
          {editingEnv && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Name</label>
                <Input
                  value={editingEnv.name}
                  onChange={(e) => setEditingEnv({ ...editingEnv, name: e.target.value })}
                  placeholder="Production"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Base URL</label>
                <Input
                  value={editingEnv.baseUrl}
                  onChange={(e) => setEditingEnv({ ...editingEnv, baseUrl: e.target.value })}
                  placeholder="https://api.example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Auth Type</label>
                <select
                  className="w-full border rounded-md p-2 text-sm bg-background"
                  value={editingEnv.authType}
                  onChange={(e) => setEditingEnv({ ...editingEnv, authType: e.target.value as AppEnvironment['authType'] })}
                >
                  <option value="none">None</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="apiKey">API Key</option>
                  <option value="basic">Basic Auth</option>
                </select>
              </div>
              {editingEnv.authType !== 'none' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    {editingEnv.authType === 'bearer' ? 'Token' : editingEnv.authType === 'apiKey' ? 'API Key' : 'Credentials (user:pass)'}
                  </label>
                  <Input
                    type="password"
                    value={editingEnv.authValue ?? ''}
                    onChange={(e) => setEditingEnv({ ...editingEnv, authValue: e.target.value })}
                    placeholder={editingEnv.authType === 'bearer' ? 'your-token' : editingEnv.authType === 'apiKey' ? 'your-api-key' : 'username:password'}
                  />
                </div>
              )}
              {editingEnv.authType === 'apiKey' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium">Header Name</label>
                  <Input
                    value={editingEnv.authHeader ?? 'X-API-Key'}
                    onChange={(e) => setEditingEnv({ ...editingEnv, authHeader: e.target.value })}
                    placeholder="X-API-Key"
                  />
                </div>
              )}
              <Button onClick={handleSaveEnv} className="w-full">Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
