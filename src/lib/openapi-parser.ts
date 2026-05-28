import { ParsedSpec, OpenApiSpec } from './types';
import { buildResourceTree } from './path-intelligence';

/**
 * Parses and validates an OpenAPI 3.x specification from a string or object.
 *
 * This function accepts either a JSON string, a YAML string, or an already parsed
 * JavaScript object. It validates the basic structure of the specification (checking
 * for the presence of `openapi`/`swagger` and `paths` fields), and then uses the
 * path intelligence module to construct a hierarchical resource tree from the paths.
 *
 * It also extracts top-level API metadata like title, version, description, tags,
 * and base server URL.
 *
 * @param input - The OpenAPI spec as a JSON string, YAML string, or parsed object.
 * @returns A promise that resolves to a `ParsedSpec` object containing the raw spec and constructed UI models.
 * @throws Error if the input is neither valid JSON nor YAML, or if the spec lacks required OpenAPI fields.
 */
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

  const hasRootTags = !!(spec.tags && spec.tags.length > 0);
  const extractedTags = hasRootTags ? undefined : new Set<string>();
  const resourceTree = buildResourceTree(spec.paths || {}, extractedTags);

  const tags = spec.tags?.map((t) => t.name) ?? (extractedTags ? Array.from(extractedTags) : []);

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
