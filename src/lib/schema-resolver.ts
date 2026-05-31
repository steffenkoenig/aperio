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
function resolveAllOf(
  schema: SchemaObject,
  components: Components,
  visited: Set<string>
): SchemaObject {
  let result: SchemaObject = { ...schema };
  if (schema.allOf && schema.allOf.length > 0) {
    for (const sub of schema.allOf) {
      const resolved = resolveSchema(sub, components, visited);
      result = mergeSchemas(result, resolved);
    }
    result = { ...result, allOf: undefined };
  }
  return result;
}

function resolveAnyOfOneOf(
  schema: SchemaObject,
  components: Components,
  visited: Set<string>
): SchemaObject {
  let result: SchemaObject = { ...schema };
  for (const key of ['anyOf', 'oneOf'] as const) {
    const variants = schema[key];
    if (variants && variants.length > 0) {
      for (const sub of variants) {
        const resolved = resolveSchema(sub, components, visited);
        result = mergeSchemas(result, resolved);
      }
      result = { ...result, [key]: undefined };
    }
  }
  return result;
}

function resolveProperties(
  schema: SchemaObject,
  components: Components,
  visited: Set<string>
): SchemaObject {
  let result: SchemaObject = { ...schema };
  if (result.properties) {
    const resolvedProps: Record<string, SchemaObject> = {};
    for (const [name, propSchema] of Object.entries(result.properties)) {
      resolvedProps[name] = resolveSchema(propSchema, components, visited);
    }
    result = { ...result, properties: resolvedProps };
  }
  return result;
}

function resolveItems(
  schema: SchemaObject,
  components: Components,
  visited: Set<string>
): SchemaObject {
  let result: SchemaObject = { ...schema };
  if (result.items) {
    if (Array.isArray(result.items)) {
      result = {
        ...result,
        items: (result.items as SchemaObject[]).map(item => resolveSchema(item, components, visited)) as unknown as SchemaObject
      };
    } else {
      result = {
        ...result,
        items: resolveSchema(result.items as SchemaObject, components, visited)
      };
    }
  }
  return result;
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
    try {
      return resolveSchema(resolved, components, visited);
    } finally {
      visited.delete(schema.$ref);
    }
  }

  let result: SchemaObject = { ...schema };

  result = resolveAllOf(result, components, visited);
  result = resolveAnyOfOneOf(result, components, visited);
  result = resolveProperties(result, components, visited);
  result = resolveItems(result, components, visited);

  return result;
}
