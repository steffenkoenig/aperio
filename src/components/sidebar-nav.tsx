'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ResourceNode } from '@/lib/types';
import { ChevronRight, Database, Zap, Box, FolderOpen, Folder } from 'lucide-react';
import { cn, pathToSlug } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarNavProps {
  nodes: ResourceNode[];
  specTitle: string;
}

function getNodeIcon(node: ResourceNode) {
  switch (node.type) {
    case 'root-resource': return Database;
    case 'action': return Zap;
    case 'singleton': return Box;
    default: return FolderOpen;
  }
}

function getMethodBadgeVariant(method: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (method.toLowerCase()) {
    case 'post': return 'default';
    case 'put':
    case 'patch': return 'secondary';
    case 'delete': return 'destructive';
    default: return 'outline';
  }
}

interface NavItemProps {
  node: ResourceNode;
  depth: number;
}

function NavItem({ node, depth }: NavItemProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const Icon = getNodeIcon(node);
  const nodeHref = `/dashboard/resource/${encodeURIComponent(pathToSlug(node.path))}`;
  const isActive = pathname === nodeHref;

  const nonGetMethods = node.methods.filter((m) => m !== 'get');

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors',
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          depth > 0 && 'ml-4'
        )}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 p-0.5 rounded hover:bg-accent-foreground/10"
          >
            {expanded ? (
              <FolderOpen className="h-3.5 w-3.5" />
            ) : (
              <Folder className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        )}
        <Link href={nodeHref} className="flex-1 truncate">
          {node.name}
        </Link>
        {nonGetMethods.length > 0 && (
          <div className="flex gap-0.5">
            {nonGetMethods.slice(0, 2).map((m) => (
              <Badge
                key={m}
                variant={getMethodBadgeVariant(m)}
                className="text-[9px] px-1 py-0 h-4 font-mono"
              >
                {m.toUpperCase()}
              </Badge>
            ))}
          </div>
        )}
        {hasChildren && (
          <ChevronRight
            className={cn('h-3 w-3 transition-transform flex-shrink-0', expanded && 'rotate-90')}
            onClick={() => setExpanded(!expanded)}
          />
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <NavItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarNav({ nodes, specTitle }: SidebarNavProps) {
  return (
    <aside className="flex flex-col w-64 border-r bg-background h-full">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">A</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{specTitle}</p>
            <p className="text-[10px] text-muted-foreground">Aperio Dashboard</p>
          </div>
        </Link>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Overview
          </Link>
          <div className="h-px bg-border my-2" />
          {nodes.map((node) => (
            <NavItem key={node.id} node={node} depth={0} />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
