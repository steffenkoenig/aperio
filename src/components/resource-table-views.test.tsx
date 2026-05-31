import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResourceTable } from './resource-table';
import { useSpecStore } from '../store/spec-store';

// Mock dependencies
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Radix UI DropdownMenu uses PointerEvent internally
if (typeof window !== 'undefined') {
  window.PointerEvent = class PointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    pointerType: string;

    constructor(type: string, props: unknown) {
      super(type, props as EventInit);
      const p = props as Record<string, unknown> | undefined;
      this.button = (p?.button as number) || 0;
      this.ctrlKey = (p?.ctrlKey as boolean) || false;
      this.pointerType = (p?.pointerType as string) || 'mouse';
    }
  } as unknown as typeof Event;
}

// Mock HTMLElement.prototype.scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.HTMLElement.prototype.releasePointerCapture = jest.fn();

describe('ResourceTable - Saved Views UI', () => {
  beforeEach(() => {
    useSpecStore.setState({
      activeEnvironmentId: 'default',
      environments: [{ id: 'default', name: 'Default', baseUrl: 'http://localhost', authType: 'none' }],
      parsedSpec: { title: 'TestAPI', version: '1.0' } as unknown as import('@/lib/types').ParsedSpec,
      savedViews: {},
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ id: 1, name: 'John Doe', role: 'admin' }]),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the Columns and Views dropdown buttons', async () => {
    render(<ResourceTable path="/users" pathParams={{}} />);

    await waitFor(() => {
      expect(screen.getByText('Columns')).toBeInTheDocument();
      expect(screen.getByText('Views')).toBeInTheDocument();
    });
  });

  it('can open the save view dialog', async () => {
    render(<ResourceTable path="/users" pathParams={{}} />);

    await waitFor(() => {
      expect(screen.getByText('Views')).toBeInTheDocument();
    });

    const viewsButton = screen.getByText('Views');

    // DropdownMenu requires a pointer down event to open in jsdom
    fireEvent.pointerDown(viewsButton, { button: 0, ctrlKey: false, pointerType: 'mouse' });
    fireEvent.click(viewsButton);

    await waitFor(() => {
      expect(screen.getByText('Save current view...')).toBeInTheDocument();
    });

    const saveMenuItem = screen.getByText('Save current view...');
    fireEvent.pointerDown(saveMenuItem, { button: 0, ctrlKey: false, pointerType: 'mouse' });
    fireEvent.click(saveMenuItem);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter view name...')).toBeInTheDocument();
      expect(screen.getAllByText('Save View').length).toBeGreaterThan(0);
    });
  });
});
