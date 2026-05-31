import { useMemo } from 'react';
import { FormFieldProps } from './types';
import { resolveSchema } from '@/lib/schema-resolver';
import { ObjectField } from './object-field';
import { ArrayField } from './array-field';
import { SimpleField } from './simple-field';

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
      <ObjectField
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
      <ArrayField
        name={name}
        schema={schema}
        value={value}
        onChange={onChange}
        required={required}
        components={components}
        label={label}
        itemSchema={itemSchema}
      />
    );
  }

  return (
    <SimpleField
      name={name}
      schema={schema}
      value={value}
      onChange={onChange}
      required={required}
      label={label}
      type={type}
    />
  );
}
