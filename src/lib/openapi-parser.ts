import { ParsedSpec, OpenApiSpec, ResourceNode } from './types';
import { buildResourceTree } from './path-intelligence';

export async function parseOpenApiSpec(input: string | object): Promise<ParsedSpec> {
  let spec: OpenApiSpec;

  if (typeof input === 'string') {
    // Try to parse as JSON first, then YAML
    try {
      spec = JSON.parse(input) as OpenApiSpec;
    } catch {
      // Try YAML parsing via dynamic import
      try {
        const yaml = await import('js-yaml');
        spec = yaml.load(input) as OpenApiSpec;
      } catch {
        throw new Error('Failed to parse spec: not valid JSON or YAML');
      }
    }
  } else {
    spec = input as OpenApiSpec;
  }

  // Validate it looks like an OpenAPI spec
  const specRecord = spec as unknown as Record<string, unknown>;
  if (!spec.paths && !spec.openapi && !specRecord['swagger']) {
    throw new Error('Invalid OpenAPI spec: missing paths or openapi field');
  }

  const resourceTree = buildResourceTree(spec.paths || {});

  const tags = spec.tags?.map((t) => t.name) ?? 
    [...new Set(
      Object.values(spec.paths || {}).flatMap((item) =>
        Object.values(item)
          .filter((op): op is { tags?: string[] } => typeof op === 'object' && op !== null && 'tags' in op)
          .flatMap((op) => op.tags ?? [])
      )
    )];

  const baseUrl = spec.servers?.[0]?.url;

  return {
    raw: spec,
    resourceTree,
    title: spec.info?.title ?? 'API',
    version: spec.info?.version ?? '1.0.0',
    description: spec.info?.description,
    baseUrl,
    tags,
  };
}
