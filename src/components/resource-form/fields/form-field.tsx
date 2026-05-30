import { useMemo } from 'react';
import { SchemaObject, OpenApiSpec } from '@/lib/types';
import { resolveSchema } from '@/lib/schema-resolver';
import { FormFieldObject } from './form-field-object';
import { FormFieldArray } from './form-field-array';
import { FormFieldSimple } from './form-field-simple';

export interface FormFieldProps {
  name: string;
  schema: SchemaObject;
  value: unknown;
  onChange: (val: unknown) => void;
  required: boolean;
  components: OpenApiSpec['components'];
}

export function FormField({ name, schema, value, onChange, required, components }: FormFieldProps) {
  const itemSchema = useMemo(() => {
    if (schema.type !== 'array') return null;
    return schema.items ? resolveSchema(schema.items, components) : null;
  }, [schema.type, schema.items, components]);

  if (schema['x-pathform-hidden']) return null;

  const label = schema.title ?? name;
  const type = schema.type ?? 'string';

  if (type === 'object') {
    return (
      <FormFieldObject
        name={name}
        schema={schema}
        value={value}
        onChange={onChange}
        required={required}
        components={components}
        label={label}
      />
    );
  }

  if (type === 'array') {
    return (
      <FormFieldArray
        name={name}
        schema={schema}
        itemSchema={itemSchema}
        value={value}
        onChange={onChange}
        required={required}
        components={components}
        label={label}
      />
    );
  }

  return (
    <FormFieldSimple
      name={name}
      schema={schema}
      value={value}
      onChange={onChange}
      required={required}
      label={label}
    />
  );
}
