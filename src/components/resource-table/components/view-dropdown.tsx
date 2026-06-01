import { ChangeEvent } from 'react';

interface ResourceTableViewDropdownProps {
  activeViewId: string;
  savedViewsForPath: { id: string; name: string }[];
  handleSelectView: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export function ResourceTableViewDropdown({
  activeViewId,
  savedViewsForPath,
  handleSelectView,
}: ResourceTableViewDropdownProps) {
  if (savedViewsForPath.length === 0) return null;

  return (
    <select
      className="h-8 text-xs border rounded bg-background px-2 py-1 max-w-[150px] outline-none"
      value={activeViewId}
      onChange={handleSelectView}
    >
      <option value="default">Default View</option>
      {savedViewsForPath.map(v => (
        <option key={v.id} value={v.id}>{v.name}</option>
      ))}
    </select>
  );
}
