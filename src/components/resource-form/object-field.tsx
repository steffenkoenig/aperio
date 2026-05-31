import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SchemaObject, OpenApiSpec } from '@/lib/types';
import { FormField } from './form-field';

interface ObjectFieldProps {
  name: string;
  schema: SchemaObject;
  value: unknown;
  onChange: (val: unknown) => void;
  required: boolean;
  components: OpenApiSpec['components'];
  label: string;
}

export function ObjectField({  schema, value, onChange, required, components, label }: ObjectFieldProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
