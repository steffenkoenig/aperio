import { Input } from '@/components/ui/input';
import { SchemaObject } from '@/lib/types';

interface SimpleFieldProps {
  name: string;
  schema: SchemaObject;
  value: unknown;
  onChange: (val: unknown) => void;
  required: boolean;
  label: string;
  type: string;
}

export function SimpleField({  schema, value, onChange, required, label, type }: SimpleFieldProps) {
  if (type === 'array') {
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
          {schema.description && (
            <span className="text-muted-foreground font-normal">– {schema.description}</span>
          )}
        </label>
        <Input
          value={Array.isArray(value) ? (value as unknown[]).join(', ') : String(value ?? '')}
          onChange={(e) => {
            const val = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
            onChange(val.length > 0 ? val : undefined);
          }}
          placeholder="comma, separated, values"
          className="h-8 text-sm border-muted/70"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
        {schema.description && (
          <span className="text-muted-foreground font-normal">– {schema.description}</span>
        )}
      </label>
      {type === 'boolean' ? (
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-muted/50 text-primary focus:ring-primary h-4 w-4"
          />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ) : schema.enum ? (
        <select
          className="w-full border rounded-md p-2 text-sm bg-background border-muted/70 focus:border-primary focus:outline-none"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select...</option>
          {schema.enum.map((opt) => (
            <option key={String(opt)} value={String(opt)}>{String(opt)}</option>
          ))}
        </select>
      ) : type === 'integer' || type === 'number' ? (
        <Input
          type="number"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
          placeholder={String(schema.default ?? '')}
          min={schema.minimum}
          max={schema.maximum}
          className="h-8 text-sm border-muted/70"
        />
      ) : (
        <Input
          type={schema.format === 'password' ? 'password' : schema.format === 'email' ? 'email' : 'text'}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={String(schema.default ?? schema.description ?? '')}
          minLength={schema.minLength}
          maxLength={schema.maxLength}
          className="h-8 text-sm border-muted/70"
        />
      )}
    </div>
  );
}
