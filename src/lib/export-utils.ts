export function serializeComplexData(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

export function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  const headers = Array.from(
    new Set(data.flatMap((row) => Object.keys(row)))
  );

  const csvRows = [];

  // Add headers
  csvRows.push(headers.map(header => `"${header.replace(/"/g, '""')}"`).join(','));

  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const serialized = serializeComplexData(val);
      // Escape quotes and wrap in quotes
      return `"${serialized.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTableToCSV(data: Record<string, unknown>[], filename: string = 'export.csv') {
  const csvContent = convertToCSV(data);
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportTableToJSON(data: Record<string, unknown>[], filename: string = 'export.json') {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
}
