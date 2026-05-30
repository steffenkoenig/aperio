import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SidebarNav } from './sidebar-nav';
import { ResourceTable } from './resource-table';
import { useSpecStore } from '../store/spec-store';
import { ResourceNode } from '../lib/types';

jest.mock('../store/spec-store', () => ({
  useSpecStore: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/dashboard/resource/user',
}));

// Mock fetch to prevent "fetch is not defined" error when ResourceTable mounts
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
    ok: true,
  })
) as jest.Mock;

describe('Saved Views & Favorites Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SidebarNav Favorites', () => {
    it('renders a Favorites section when there are favorites', () => {
      const mockNodes: ResourceNode[] = [
        {
          id: 'user-node',
          name: 'User',
          path: '/user',
          slug: 'user',
          type: 'action',
          methods: ['get'],
          operations: {},
          children: [],
        },
      ];

      (useSpecStore as unknown as jest.Mock).mockReturnValue({
        favorites: ['user-node'],
        addFavorite: jest.fn(),
        removeFavorite: jest.fn(),
      });

      render(<SidebarNav nodes={mockNodes} specTitle="Test Spec" />);

      expect(screen.getByText('Favorites')).toBeInTheDocument();
      const userLinks = screen.getAllByText('User');
      // Should appear twice: once in Favorites, once in main nav
      expect(userLinks.length).toBeGreaterThan(1);
    });
  });

  describe('ResourceTable Saved Views', () => {
    it('renders the view selector and save button', async () => {
      (useSpecStore as unknown as jest.Mock).mockReturnValue({
        getActiveEnvironment: () => ({ baseUrl: 'http://test' }),
        savedViews: {
          '/user': [{ id: 'v1', name: 'Active Users', sorting: [], globalFilter: '' }],
        },
        addSavedView: jest.fn(),
      });

      render(<ResourceTable path="/user" />);

      // Wait for fetch to complete and UI to render
      await waitFor(() => {
        expect(screen.getByText('Default View')).toBeInTheDocument();
      });

      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save View' })).toBeInTheDocument();
    });
  });
});
