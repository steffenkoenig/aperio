import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { SchemaObject, OpenApiSpec } from '@/lib/types';
import { FormField } from './form-field';

interface FormFieldArrayProps {
  name: string;
  schema: SchemaObject;
  itemSchema: SchemaObject | null;
  value: unknown;
  onChange: (val: unknown) => void;
  required: boolean;
  components: OpenApiSpec['components'];
  label: string;
}

export function FormFieldArray({ schema, itemSchema, value, onChange, required, components, label }: FormFieldArrayProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
  }

  // Simple array rendering
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
