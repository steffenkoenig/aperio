import { resolveSchema } from './schema-resolver';
import { SchemaObject } from './types';

describe('Schema Resolver', () => {
  const components = {
    schemas: {
      Address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
        },
      } as SchemaObject,
      User: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          address: { $ref: '#/components/schemas/Address' },
          roles: {
            type: 'array',
            items: { type: 'string' },
          },
          friends: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' }, // Recursive ref
          },
        },
      } as SchemaObject,
    },
  };

  it('should resolve simple schema without refs', () => {
    const schema: SchemaObject = { type: 'string' };
    const resolved = resolveSchema(schema, components);
    expect(resolved).toEqual({ type: 'string' });
  });

  it('should resolve references in object properties recursively', () => {
    const userSchema: SchemaObject = { $ref: '#/components/schemas/User' };
    const resolved = resolveSchema(userSchema, components);

    expect(resolved.type).toBe('object');
    expect(resolved.properties?.name).toEqual({ type: 'string' });
    
    // Nested object ref resolved
    expect(resolved.properties?.address).toBeDefined();
    expect(resolved.properties?.address.type).toBe('object');
    expect(resolved.properties?.address.properties?.street).toEqual({ type: 'string' });
    expect(resolved.properties?.address.properties?.city).toEqual({ type: 'string' });
  });

  it('should resolve references in array items recursively', () => {
    const listSchema: SchemaObject = {
      type: 'array',
      items: { $ref: '#/components/schemas/Address' },
    };

    const resolved = resolveSchema(listSchema, components);

    expect(resolved.type).toBe('array');
    expect(resolved.items).toBeDefined();
    expect(resolved.items?.type).toBe('object');
    expect(resolved.items?.properties?.street).toEqual({ type: 'string' });
    expect(resolved.items?.properties?.city).toEqual({ type: 'string' });
  });

  it('should handle recursive references without infinite loops', () => {
    const userSchema: SchemaObject = { $ref: '#/components/schemas/User' };
    const resolved = resolveSchema(userSchema, components);

    expect(resolved.type).toBe('object');
    expect(resolved.properties?.friends).toBeDefined();
    expect(resolved.properties?.friends.type).toBe('array');
    // The recursive reference will be empty schema {} because it was already visited
    expect(resolved.properties?.friends.items).toEqual({});
  });
});
