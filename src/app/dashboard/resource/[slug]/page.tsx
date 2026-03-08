'use client';

import { use } from 'react';
import { useSpecStore } from '@/store/spec-store';
import { ResourceTable } from '@/components/resource-table';
import { ResourceForm } from '@/components/resource-form';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourceNode, OperationObject } from '@/lib/types';
import { Database, Zap, Box } from 'lucide-react';

function findNodeBySlug(nodes: ResourceNode[], slug: string): ResourceNode | null {
  for (const node of nodes) {
    const nodeSlug = node.path.replace(/\//g, '_').replace(/[{}]/g, '').replace(/^_/, '');
    if (nodeSlug === slug) return node;
    const found = findNodeBySlug(node.children, slug);
    if (found) return found;
  }
  return null;
}

const methodColors: Record<string, string> = {
  get: 'bg-blue-500/10 text-blue-700 border-blue-200',
  post: 'bg-green-500/10 text-green-700 border-green-200',
  put: 'bg-orange-500/10 text-orange-700 border-orange-200',
  patch: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  delete: 'bg-red-500/10 text-red-700 border-red-200',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ResourcePage({ params }: PageProps) {
  const { slug } = use(params);
  const decodedSlug = decodeURIComponent(slug);
  const { parsedSpec } = useSpecStore();

  if (!parsedSpec) return null;

  const node = findNodeBySlug(parsedSpec.resourceTree, decodedSlug);

  if (!node) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold">Resource not found</h1>
        <p className="text-muted-foreground text-sm mt-1">Slug: {decodedSlug}</p>
      </div>
    );
  }

  const typeIcon = node.type === 'action' ? Zap : node.type === 'root-resource' ? Database : Box;
  const TypeIcon = typeIcon;

  const hasList = 'get' in node.operations;
  const mutationMethods = Object.keys(node.operations).filter((m) => m !== 'get');

  const defaultTab = hasList ? 'list' : mutationMethods[0] ?? 'info';

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <TypeIcon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-bold">{node.name}</h1>
          <Badge variant="outline" className="text-xs font-mono">{node.type}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{node.path}</code>
          <div className="flex gap-1">
            {node.methods.map((m) => (
              <span key={m} className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${methodColors[m] ?? 'bg-muted'}`}>
                {m.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        {node.operations[node.methods[0]]?.description && (
          <p className="text-sm text-muted-foreground mt-2">{node.operations[node.methods[0]].description}</p>
        )}
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-4">
          {hasList && <TabsTrigger value="list">List / Fetch</TabsTrigger>}
          {mutationMethods.map((m) => (
            <TabsTrigger key={m} value={m}>
              <span className={`text-[10px] font-mono mr-1.5 px-1 py-0.5 rounded border ${methodColors[m] ?? 'bg-muted'}`}>{m.toUpperCase()}</span>
              {m === 'post' ? 'Create' : m === 'put' || m === 'patch' ? 'Update' : m === 'delete' ? 'Delete' : m}
            </TabsTrigger>
          ))}
          {node.children.length > 0 && <TabsTrigger value="children">Sub-resources</TabsTrigger>}
        </TabsList>

        {hasList && (
          <TabsContent value="list">
            <ResourceTable
              path={node.path}
              operation={node.operations['get'] as OperationObject}
            />
          </TabsContent>
        )}

        {mutationMethods.map((m) => (
          <TabsContent key={m} value={m}>
            <ResourceForm
              path={node.path}
              method={m}
              operation={node.operations[m] as OperationObject}
            />
          </TabsContent>
        ))}

        {node.children.length > 0 && (
          <TabsContent value="children">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {node.children.map((child) => (
                <a
                  key={child.id}
                  href={`/dashboard/resource/${encodeURIComponent(child.path.replace(/\//g, '_').replace(/[{}]/g, '').replace(/^_/, ''))}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/30 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{child.name}</p>
                    <code className="text-xs text-muted-foreground">{child.path}</code>
                  </div>
                  <div className="flex gap-1">
                    {child.methods.map((m) => (
                      <span key={m} className={`text-[9px] font-mono px-1 py-0.5 rounded border ${methodColors[m] ?? 'bg-muted'}`}>
                        {m.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
