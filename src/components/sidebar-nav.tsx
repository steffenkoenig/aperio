'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ResourceNode } from '@/lib/types';
import { ChevronRight, Database, Zap, Box, FolderOpen, Folder, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSpecStore } from '@/store/spec-store';

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

function NodeIcon({ node, className }: { node: ResourceNode; className?: string }) {
  return React.createElement(getNodeIcon(node), { className });
}

interface NavItemProps {
  node: ResourceNode;
  depth: number;
}

function NavItem({ node, depth }: NavItemProps) {
  const { specSource, preferences, toggleFavorite } = useSpecStore();
  const isFavorited = !!(specSource && preferences[specSource]?.favorites?.includes(node.path));

  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const nodeHref = `/dashboard/resource/${encodeURIComponent(node.slug)}`;
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
          <NodeIcon node={node} className="h-3.5 w-3.5 flex-shrink-0" />
        )}
        <Link href={nodeHref} className="flex-1 truncate">
          {node.name}
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(node.path);
          }}
          className={cn(
            "p-0.5 rounded transition-opacity",
            isFavorited ? "opacity-100 text-yellow-500 hover:text-yellow-600" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
          )}
        >
          <Star className={cn("h-3 w-3", isFavorited && "fill-current")} />
        </button>
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
  const { specSource, preferences } = useSpecStore();
  const currentFavorites = (specSource && preferences[specSource]?.favorites) || [];

  // Helper to find a node by path
  const findNodeByPath = (nodeList: ResourceNode[], targetPath: string): ResourceNode | undefined => {
    for (const node of nodeList) {
      if (node.path === targetPath) return node;
      const found = findNodeByPath(node.children, targetPath);
      if (found) return found;
    }
    return undefined;
  };

  const favoriteNodes = currentFavorites
    .map(path => findNodeByPath(nodes, path))
    .filter((node): node is ResourceNode => node !== undefined);

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
          {favoriteNodes.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Star className="h-3 w-3 fill-current text-yellow-500" /> Favorites
              </div>
              {favoriteNodes.map((node) => (
                <NavItem key={`fav-${node.id}`} node={node} depth={0} />
              ))}
              <div className="h-px bg-border my-2" />
            </div>
          )}
          {nodes.map((node) => (
            <NavItem key={node.id} node={node} depth={0} />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
