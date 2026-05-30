import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommandPalette } from './command-palette';
import { useSpecStore } from '../../src/store/spec-store';
import { useRouter } from 'next/navigation';

jest.mock('../../src/store/spec-store', () => ({
  useSpecStore: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('./ui/command', () => {
  const original = jest.requireActual('./ui/command');
  return {
    ...original,
    CommandDialog: ({ children, open }: any) => {
      if (!open) return null;
      return (
        <div data-testid="command-dialog">
          <original.Command>
            {children}
          </original.Command>
        </div>
      );
    },
  };
});

describe('CommandPalette', () => {
  const mockRouter = { push: jest.fn() };
  const mockParsedSpec = {
    title: 'Test Spec',
    version: '1.0.0',
    baseUrl: 'https://api.example.com',
    resourceTree: [
      {
        type: 'resource',
        name: 'users',
        slug: 'users',
        methods: ['GET'],
        path: '/users',
        children: []
      },
      {
        type: 'resource',
        name: 'posts',
        slug: 'posts',
        methods: ['POST'],
        path: '/posts',
        children: []
      }
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSpecStore as unknown as jest.Mock).mockReturnValue({
      parsedSpec: mockParsedSpec,
    });
  });

  it('does not render dialog initially', () => {
    render(<CommandPalette />);
    expect(screen.queryByPlaceholderText('Type a command or search...')).not.toBeInTheDocument();
  });

  it('opens dialog on Ctrl+K', async () => {
    render(<CommandPalette />);

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
    });
  });

  it('opens dialog on Cmd+K', async () => {
    render(<CommandPalette />);

    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
    });
  });

  it('displays search results correctly', async () => {
    render(<CommandPalette />);

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    await waitFor(() => {
      expect(screen.getByText('users')).toBeInTheDocument();
      expect(screen.getByText('GET')).toBeInTheDocument();
      expect(screen.getByText('/users')).toBeInTheDocument();
      expect(screen.getByText('POST')).toBeInTheDocument();
      expect(screen.getByText('/posts')).toBeInTheDocument();
    });
  });
});
