import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ResourceTable } from '@/components/resource-table';
import { useSpecStore } from '@/store/spec-store';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('ResourceTable - Saved Views UI', () => {
  beforeEach(() => {
    useSpecStore.setState({
      activeEnvironmentId: 'default',
      environments: [{ id: 'default', name: 'Default', baseUrl: 'http://localhost', authType: 'none' }],
      parsedSpec: { title: 'TestAPI', version: '1.0' } as unknown as import('@/lib/types').ParsedSpec,
      specSource: 'https://example.com/spec.json',
      preferences: {},
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'John Doe', role: 'admin' }]),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the Save View button and filter input', async () => {
    render(<ResourceTable path="/users" pathParams={{}} />);

    await waitFor(() => {
      expect(screen.getByText('Save View')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Filter...')).toBeInTheDocument();
    });
  });

  it('renders the Export and Refresh buttons', async () => {
    render(<ResourceTable path="/users" pathParams={{}} />);

    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });
});
