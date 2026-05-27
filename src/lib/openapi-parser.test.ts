import { parseOpenApiSpec } from './openapi-parser';

describe('OpenAPI Parser', () => {
  it('should throw error for invalid spec input', async () => {
    await expect(parseOpenApiSpec('!!!invalid json!!!')).rejects.toThrow('Failed to parse spec: not valid JSON or YAML');
  });

  it('should throw error if spec is missing openapi or paths field', async () => {
    await expect(parseOpenApiSpec({ info: { title: 'Test API' } })).rejects.toThrow('Invalid OpenAPI spec: missing paths or openapi field');
  });

  it('should successfully parse a valid JSON string spec', async () => {
    const validSpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
            summary: 'Test endpoint',
            tags: ['TestTag']
          }
        }
      }
    };

    const parsed = await parseOpenApiSpec(JSON.stringify(validSpec));

    expect(parsed.title).toBe('Test API');
    expect(parsed.version).toBe('1.0.0');
    expect(parsed.tags).toContain('TestTag');
    expect(parsed.resourceTree).toBeDefined();
  });

  it('should successfully parse a valid JS object spec', async () => {
    const validSpec = {
      openapi: '3.0.0',
      info: { title: 'Object API', version: '2.0.0' },
      paths: {}
    };

    const parsed = await parseOpenApiSpec(validSpec);

    expect(parsed.title).toBe('Object API');
    expect(parsed.version).toBe('2.0.0');
    expect(parsed.tags).toEqual([]);
    expect(parsed.resourceTree).toEqual([]);
  });
});
