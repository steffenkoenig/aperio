import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SchemaObject, OpenApiSpec } from '@/lib/types';
import { resolveSchema } from '@/lib/schema-resolver';

export interface FormFieldProps {
  name: string;
  schema: SchemaObject;
  value: unknown;
  onChange: (val: unknown) => void;
  required: boolean;
  components: OpenApiSpec['components'];
}

export function FormField({ name, schema, value, onChange, required, components }: FormFieldProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const itemSchema = useMemo(() => {
    if (schema.type !== 'array') return null;
    return schema.items ? resolveSchema(schema.items, components) : null;
  }, [schema.type, schema.items, components]);

  if (schema['x-pathform-hidden']) return null;

  const label = schema.title ?? name;
  const type = schema.type ?? 'string';

  // 1. Nested Object rendering
  if (type === 'object') {
    const properties = schema.properties ?? {};
    const subRequired = schema.required ?? [];

    return (
      <div className="space-y-2 border-l-2 pl-3 ml-1 border-muted/50 py-1.5 transition-all">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs font-semibold text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          <span>{label}</span>
          {required && <span className="text-destructive">*</span>}
          {schema.description && (
            <span className="text-[10px] font-normal text-muted-foreground line-clamp-1">– {schema.description}</span>
          )}
        </button>

        {!isCollapsed && (
          <div className="space-y-3 pt-1">
            {Object.entries(properties).map(([subName, subSchema]) => {
              const subVal = (value as Record<string, unknown> | undefined)?.[subName];
              return (
                <FormField
                  key={subName}
                  name={subName}
                  schema={subSchema as SchemaObject}
                  value={subVal}
                  onChange={(newSubVal) => {
                    const updated = { ...(value as Record<string, unknown> || {}) };
                    if (newSubVal === undefined || newSubVal === '') {
                      delete updated[subName];
                    } else {
                      updated[subName] = newSubVal;
                    }
                    onChange(Object.keys(updated).length > 0 ? updated : undefined);
                  }}
                  required={subRequired.includes(subName)}
                  components={components}
                />
              );
            })}
            {Object.keys(properties).length === 0 && (
              <p className="text-xs text-muted-foreground italic pl-1">Empty Object</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // 2. Array rendering
  if (type === 'array') {
    const itemType = itemSchema?.type ?? 'string';

    if (itemType === 'object') {
      const arrayVal = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];

      return (
        <div className="space-y-2 border-l-2 pl-3 ml-1 border-muted/50 py-1.5 transition-all">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-xs font-semibold text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none"
            >
              {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span>{label}</span>
              {required && <span className="text-destructive">*</span>}
              {schema.description && (
                <span className="text-[10px] font-normal text-muted-foreground line-clamp-1">– {schema.description}</span>
              )}
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onChange([...arrayVal, {}]);
                setIsCollapsed(false);
              }}
              className="h-6 text-[10px] px-2 flex items-center gap-1 border-primary/20 text-primary hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" />
              Add Item
            </Button>
          </div>

          {!isCollapsed && (
            <div className="space-y-3 pt-1">
              {arrayVal.length === 0 ? (
                <p className="text-xs text-muted-foreground italic pl-1">No items added</p>
              ) : (
                <div className="space-y-3">
                  {arrayVal.map((item, index) => (
                    <div key={index} className="relative border rounded-md p-3 bg-muted/5 border-muted/60 space-y-3">
                      <div className="flex items-center justify-between border-b pb-1.5 mb-1.5 border-muted/60">
                        <span className="text-[10px] font-mono font-medium text-muted-foreground">Item #{index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newArray = [...arrayVal];
                            newArray.splice(index, 1);
                            onChange(newArray.length > 0 ? newArray : undefined);
                          }}
                          className="h-5 text-[10px] px-1.5 text-destructive hover:text-destructive/90 hover:bg-destructive/10 flex items-center gap-0.5"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                      {itemSchema && itemSchema.properties ? (
                        Object.entries(itemSchema.properties).map(([subName, subSchema]) => {
                          const subVal = item?.[subName];
                          return (
                            <FormField
                              key={subName}
                              name={subName}
                              schema={subSchema as SchemaObject}
                              value={subVal}
                              onChange={(newSubVal) => {
                                const newArray = [...arrayVal];
                                const updatedItem = { ...newArray[index] };
                                if (newSubVal === undefined || newSubVal === '') {
                                  delete updatedItem[subName];
                                } else {
                                  updatedItem[subName] = newSubVal;
                                }
                                newArray[index] = updatedItem;
                                onChange(newArray);
                              }}
                              required={(itemSchema.required ?? []).includes(subName)}
                              components={components}
                            />
                          );
                        })
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    } else {
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
  }

  // 3. Simple fields
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
