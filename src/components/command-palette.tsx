'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSpecStore } from '@/store/spec-store';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ResourceNode } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { pathToSlug } from '@/lib/utils';

interface SearchResult {
  title: string;
  type: 'resource' | 'endpoint';
  path?: string;
  method?: string;
  slug: string;
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { parsedSpec } = useSpecStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const results = React.useMemo(() => {
    if (!parsedSpec) return [];

    const items: SearchResult[] = [];

    const traverse = (nodes: ResourceNode[], parentSlug: string = '') => {
      nodes.forEach((node) => {
        const slug = node.slug || parentSlug;

        // A node can be a resource (has methods/children)
        items.push({
          title: node.name,
          type: 'resource',
          slug: node.slug || pathToSlug(node.name),
        });

        // A node can also have methods/endpoints
        if (node.methods && node.methods.length > 0) {
          node.methods.forEach(method => {
            items.push({
              title: `${method.toUpperCase()} ${node.path}`,
              type: 'endpoint',
              path: node.path,
              method: method.toUpperCase(),
              slug: node.slug || pathToSlug(node.name),
            });
          });
        }

        if (node.children && node.children.length > 0) {
          traverse(node.children, node.slug || pathToSlug(node.name));
        }
      });
    };

    traverse(parsedSpec.resourceTree);
    return items;
  }, [parsedSpec]);

  const onSelect = (result: SearchResult) => {
    setOpen(false);

    if (result.type === 'endpoint') {
      router.push(`/dashboard/resource/${result.slug}?method=${result.method}&path=${encodeURIComponent(result.path || '')}`);
    } else {
      router.push(`/dashboard/resource/${result.slug}`);
    }
  };

  if (!parsedSpec) return null;

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div aria-describedby={undefined}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Resources">
            {results.filter(r => r.type === 'resource').map((result, i) => (
              <CommandItem
                key={`resource-${result.slug}-${i}`}
                onSelect={() => onSelect(result)}
                value={result.title}
              >
                {result.title}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Endpoints">
            {results.filter(r => r.type === 'endpoint').map((result, i) => (
              <CommandItem
                key={`endpoint-${result.slug}-${i}`}
                onSelect={() => onSelect(result)}
                value={`${result.method} ${result.path}`}
              >
                <Badge variant="outline" className="mr-2 text-[10px]">
                  {result.method}
                </Badge>
                {result.path}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        </div>
      </CommandDialog>
    </>
  );
}
