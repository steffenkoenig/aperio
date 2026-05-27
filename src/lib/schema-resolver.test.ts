import { resolveSchema } from './schema-resolver';
import { SchemaObject, OpenApiSpec } from './types';

describe('schema-resolver', () => {
  const components: OpenApiSpec['components'] = {
    schemas: {
      Tag: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' }
        }
      },
      Pet: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          tags: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Tag'
            }
          }
        }
      },
      TuplePet: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: [
              { type: 'string' },
              { $ref: '#/components/schemas/Tag' }
            ] as unknown as SchemaObject // cast since SchemaObject doesn't strictly define array items
          }
        }
      }
    }
  };

  it('should recursively resolve array items schema', () => {
    const resolved = resolveSchema(components.schemas!.Pet, components);

    expect(resolved.properties?.tags?.items).toBeDefined();
    expect((resolved.properties?.tags?.items as SchemaObject).type).toBe('object');
    expect((resolved.properties?.tags?.items as SchemaObject).properties?.id).toBeDefined();
    expect((resolved.properties?.tags?.items as SchemaObject).properties?.name).toBeDefined();
  });

  it('should recursively resolve array items tuple schemas', () => {
    const resolved = resolveSchema(components.schemas!.TuplePet, components);

    const items = resolved.properties?.tags?.items as unknown as SchemaObject[];
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBe(2);
    expect(items[0].type).toBe('string');
    expect(items[1].type).toBe('object');
    expect(items[1].properties?.id).toBeDefined();
  });

  it('should handle missing components gracefully', () => {
    const schema: SchemaObject = {
      $ref: '#/components/schemas/Missing'
    };
    const resolved = resolveSchema(schema, components);
    expect(resolved).toEqual({});
  });
});
