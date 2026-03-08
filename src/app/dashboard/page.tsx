'use client';

import { useSpecStore } from '@/store/spec-store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileText, Tag, Server, Globe, Lock } from 'lucide-react';

export default function DashboardPage() {
  const { parsedSpec } = useSpecStore();

  if (!parsedSpec) return null;

  const { raw, resourceTree, title, version, description, tags } = parsedSpec;

  const pathCount = Object.keys(raw.paths ?? {}).length;
  const schemaCount = Object.keys(raw.components?.schemas ?? {}).length;
  const rootResources = resourceTree.filter((n) => n.type === 'root-resource').length;
  const allMethods = Object.values(raw.paths ?? {}).flatMap((p) =>
    ['get', 'post', 'put', 'patch', 'delete'].filter((m) => m in p)
  );
  const methodCounts = allMethods.reduce<Record<string, number>>((acc, m) => {
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {});

  const methodColors: Record<string, string> = {
    get: 'bg-blue-500/10 text-blue-600',
    post: 'bg-green-500/10 text-green-600',
    put: 'bg-orange-500/10 text-orange-600',
    patch: 'bg-yellow-500/10 text-yellow-600',
    delete: 'bg-red-500/10 text-red-600',
  };

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <Badge variant="outline">v{version}</Badge>
          {raw.openapi && <Badge variant="secondary">OpenAPI {raw.openapi}</Badge>}
        </div>
        {description && <p className="text-muted-foreground text-sm max-w-2xl">{description}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: FileText, label: 'Endpoints', value: pathCount },
          { icon: Database, label: 'Root Resources', value: rootResources },
          { icon: Tag, label: 'Schemas', value: schemaCount },
          { icon: Server, label: 'Tags', value: tags.length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* HTTP Methods */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">HTTP Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(methodCounts).map(([method, count]) => (
                <div key={method} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium ${methodColors[method] ?? 'bg-muted'}`}>
                  <span className="font-mono">{method.toUpperCase()}</span>
                  <span className="opacity-70">×{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Servers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Servers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {raw.servers && raw.servers.length > 0 ? (
              <div className="space-y-1.5">
                {raw.servers.map((server, i) => (
                  <div key={i} className="text-xs">
                    <code className="font-mono bg-muted px-1.5 py-0.5 rounded">{server.url}</code>
                    {server.description && <span className="text-muted-foreground ml-2">{server.description}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No servers defined</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Schemes */}
      {raw.components?.securitySchemes && Object.keys(raw.components.securitySchemes).length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Security Schemes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(raw.components.securitySchemes).map(([name, scheme]) => (
                <div key={name} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50 text-xs">
                  <span className="font-medium">{name}</span>
                  <Badge variant="outline" className="text-[9px] px-1 h-4">{scheme.type}</Badge>
                  {scheme.scheme && <span className="text-muted-foreground">{scheme.scheme}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
