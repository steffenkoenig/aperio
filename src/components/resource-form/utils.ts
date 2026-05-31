import { OperationObject, SchemaObject } from '@/lib/types';

export function getSchema(operation: OperationObject): SchemaObject | null {
  const content = operation.requestBody?.content;
  if (!content) return null;
  // We always send JSON, so prefer JSON schema; fall back to urlencoded for field introspection only
  return (
    content['application/json']?.schema ??
    content['application/x-www-form-urlencoded']?.schema ??
    null
  );
}
