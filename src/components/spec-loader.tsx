'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Link, Loader2, FileJson } from 'lucide-react';
import { useSpecStore } from '@/store/spec-store';
import { toast } from 'sonner';
import { ParsedSpec } from '@/lib/types';

export function SpecLoader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setParsedSpec } = useSpecStore();

  const loadSpec = async (input: { url?: string; content?: string }, source: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/parse-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? 'Failed to load spec');
      }
      const parsed = await res.json() as ParsedSpec;
      setParsedSpec(parsed, source);
      toast.success(`Loaded: ${parsed.title} v${parsed.version}`);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load spec');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    void loadSpec({ url: url.trim() }, url.trim());
  };

  const handleFileChange = async (file: File) => {
    const content = await file.text();
    void loadSpec({ content }, file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFileChange(file);
  };

  const quickLoad = (exampleUrl: string) => {
    setUrl(exampleUrl);
    void loadSpec({ url: exampleUrl }, exampleUrl);
  };

  return (
    <div className="space-y-6 w-full max-w-2xl">
      {/* URL Input */}
      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="https://petstore3.swagger.io/api/v3/openapi.json"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading || !url.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load'}
        </Button>
      </form>

      {/* File Upload */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".json,.yaml,.yml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFileChange(file);
          }}
        />
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
        ) : (
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">Drop your OpenAPI spec here</p>
        <p className="text-xs text-muted-foreground mt-1">Supports JSON and YAML</p>
      </div>

      {/* Quick Examples */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Try an example</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Petstore (Swagger)', url: 'https://petstore3.swagger.io/api/v3/openapi.json' },
            { label: 'GitHub API', url: 'https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json' },
          ].map((ex) => (
            <Button
              key={ex.label}
              variant="outline"
              size="sm"
              onClick={() => quickLoad(ex.url)}
              disabled={isLoading}
              className="text-xs"
            >
              <FileJson className="h-3 w-3 mr-1" />
              {ex.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
