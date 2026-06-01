import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResourceTable } from '@/components/resource-table';
import { useSpecStore } from '@/store/spec-store';
import * as exportUtils from '@/lib/export-utils';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/export-utils', () => ({
  exportTableToCSV: jest.fn(),
  exportTableToJSON: jest.fn(),
}));

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.PointerEvent = class extends MouseEvent {
  constructor(type: string, params: PointerEventInit = {}) {
    super(type, params);
  }
} as unknown;

global.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('ResourceTable - Export Functionality', () => {
  beforeEach(() => {
    useSpecStore.setState({
      activeEnvironmentId: 'default',
      environments: [{ id: 'default', name: 'Default', baseUrl: 'http://localhost', authType: 'none' }],
      parsedSpec: { title: 'TestAPI', version: '1.0' } as unknown as import('@/lib/types').ParsedSpec,
      specSource: 'https://example.com/spec.json',
      preferences: {},
    });

    if (typeof global.fetch === 'undefined') {
      Object.defineProperty(global, 'fetch', {
        value: jest.fn(),
        writable: true,
        configurable: true,
      });
    }

    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'John Doe', role: 'admin' }]),
      }) as Promise<Response>
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders Export dropdown and triggers export functions', async () => {
    render(<ResourceTable path="/users" pathParams={{}} />);

    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /export/i });

    // Radix dropdowns respond better to pointerdown instead of click in JSDOM
    fireEvent.pointerDown(exportBtn);

    const csvOption = await screen.findByRole('menuitem', { name: 'Export as CSV' });
    expect(csvOption).toBeInTheDocument();

    fireEvent.click(csvOption);
    expect(exportUtils.exportTableToCSV).toHaveBeenCalled();

    fireEvent.pointerDown(exportBtn);

    const jsonOption = await screen.findByRole('menuitem', { name: 'Export as JSON' });
    expect(jsonOption).toBeInTheDocument();

    fireEvent.click(jsonOption);
    expect(exportUtils.exportTableToJSON).toHaveBeenCalled();
  });

  it('correctly filters out path parameters from export filename', async () => {
    render(<ResourceTable path="/users/{id}/orders" pathParams={{ id: '123' }} />);

    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /export/i });
    fireEvent.pointerDown(exportBtn);

    const csvOption = await screen.findByRole('menuitem', { name: 'Export as CSV' });
    fireEvent.click(csvOption);

    const expectedDate = new Date().toISOString().split('T')[0];
    expect(exportUtils.exportTableToCSV).toHaveBeenCalledWith(
      expect.any(Array),
      `orders_export_${expectedDate}.csv`
    );
  });
});
