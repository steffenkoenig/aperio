import { SchemaObject, OpenApiSpec } from '@/lib/types';

type Components = OpenApiSpec['components'];

/**
 * Resolve a $ref string like "#/components/schemas/Foo" to the referenced SchemaObject.
 */
function resolveRef(ref: string, components: Components): SchemaObject | null {
  const match = ref.match(/^#\/components\/schemas\/(.+)$/);
  if (!match) return null;
  return components?.schemas?.[match[1]] ?? null;
}

/**
 * Merge two SchemaObjects, combining their properties and required arrays.
 */
function mergeSchemas(base: SchemaObject, override: SchemaObject): SchemaObject {
  return {
    ...base,
    ...override,
    properties: {
      ...(base.properties ?? {}),
      ...(override.properties ?? {}),
    },
    required: [
      ...(base.required ?? []),
      ...(override.required ?? []),
    ],
  };
}

/**
 * Fully resolve a SchemaObject, following $ref and merging allOf/anyOf/oneOf.
 * Returns a new SchemaObject with all properties merged at the top level.
 */
export function resolveSchema(
  schema: SchemaObject,
  components: Components,
  visited: Set<string> = new Set()
): SchemaObject {
  // Resolve $ref first
  if (schema.$ref) {
    if (visited.has(schema.$ref)) return {};
    const resolved = resolveRef(schema.$ref, components);
    if (!resolved) return {};
    visited.add(schema.$ref);
    return resolveSchema(resolved, components, visited);
  }

  let result: SchemaObject = { ...schema };

  // Merge allOf schemas (all constraints apply).
  // Each sub-schema gets a snapshot of visited so siblings don't block each
  // other from resolving the same $ref, while still inheriting the ancestors'
  // visited refs to break cycles that travel through the current chain.
  if (schema.allOf && schema.allOf.length > 0) {
    for (const sub of schema.allOf) {
      const resolved = resolveSchema(sub, components, new Set(visited));
      result = mergeSchemas(result, resolved);
    }
    // allOf is consumed, remove it from result to avoid double-processing
    result = { ...result, allOf: undefined };
  }

  // Merge anyOf/oneOf schemas (show all possible fields).
  // Same sibling-isolation reasoning as allOf above.
  for (const key of ['anyOf', 'oneOf'] as const) {
    const variants = schema[key];
    if (variants && variants.length > 0) {
      for (const sub of variants) {
        const resolved = resolveSchema(sub, components, new Set(visited));
        result = mergeSchemas(result, resolved);
      }
      result = { ...result, [key]: undefined };
    }
  }

  // Recursively resolve nested properties.
  if (result.properties) {
    const resolvedProps: Record<string, SchemaObject> = {};
    for (const [name, propSchema] of Object.entries(result.properties)) {
      resolvedProps[name] = resolveSchema(propSchema, components, new Set(visited));
    }
    result = { ...result, properties: resolvedProps };
  }

  return result;
}
