import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SidebarNav } from './sidebar-nav';
import { useSpecStore } from '../store/spec-store';
import { ResourceNode } from '../lib/types';

jest.mock('../store/spec-store', () => ({
  useSpecStore: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/dashboard/resource/user',
}));

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

describe('Saved Views & Favorites Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SidebarNav Favorites', () => {
    it('renders a Favorites section when the current spec has favorites', () => {
      (useSpecStore as unknown as jest.Mock).mockReturnValue({
        specSource: 'https://example.com/spec.json',
        preferences: {
          'https://example.com/spec.json': {
            favorites: ['/user'],
            savedViews: [],
          },
        },
        toggleFavorite: jest.fn(),
      });

      render(<SidebarNav nodes={mockNodes} specTitle="Test Spec" />);

      expect(screen.getByText('Favorites')).toBeInTheDocument();
      const userLinks = screen.getAllByText('User');
      expect(userLinks.length).toBeGreaterThan(1);
    });

    it('does not render a Favorites section when there are no favorites', () => {
      (useSpecStore as unknown as jest.Mock).mockReturnValue({
        specSource: 'https://example.com/spec.json',
        preferences: {
          'https://example.com/spec.json': {
            favorites: [],
            savedViews: [],
          },
        },
        toggleFavorite: jest.fn(),
      });

      render(<SidebarNav nodes={mockNodes} specTitle="Test Spec" />);

      expect(screen.queryByText('Favorites')).not.toBeInTheDocument();
    });

    it('does not render a Favorites section when specSource is null', () => {
      (useSpecStore as unknown as jest.Mock).mockReturnValue({
        specSource: null,
        preferences: {},
        toggleFavorite: jest.fn(),
      });

      render(<SidebarNav nodes={mockNodes} specTitle="Test Spec" />);

      expect(screen.queryByText('Favorites')).not.toBeInTheDocument();
    });
  });
});
