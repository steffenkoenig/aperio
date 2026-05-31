import { SchemaObject, OpenApiSpec, OperationObject } from '@/lib/types';

export interface FormFieldProps {
  name: string;
  schema: SchemaObject;
  value: unknown;
  onChange: (val: unknown) => void;
  required: boolean;
  components: OpenApiSpec['components'];
}

export interface ResourceFormProps {
  path: string;
  method: string;
  operation: OperationObject;
  pathParams?: Record<string, string>;
  onSuccess?: (data: unknown) => void;
}
