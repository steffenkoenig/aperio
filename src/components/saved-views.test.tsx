import { renderHook, act } from '@testing-library/react';
import { useSpecStore } from '../store/spec-store';

describe('useSpecStore - Favorites and Saved Views', () => {
  beforeEach(() => {
    act(() => {
      useSpecStore.setState({ favorites: {}, savedViews: {} });
    });
  });

  it('should toggle favorites correctly', () => {
    const { result } = renderHook(() => useSpecStore());

    expect(result.current.isFavorite('test-api', 'user-slug')).toBe(false);

    act(() => {
      result.current.toggleFavorite('test-api', 'user-slug');
    });

    expect(result.current.isFavorite('test-api', 'user-slug')).toBe(true);
    expect(result.current.getFavorites('test-api')).toContain('user-slug');

    act(() => {
      result.current.toggleFavorite('test-api', 'user-slug');
    });

    expect(result.current.isFavorite('test-api', 'user-slug')).toBe(false);
    expect(result.current.getFavorites('test-api')).not.toContain('user-slug');
  });

  it('should add and remove saved views correctly', () => {
    const { result } = renderHook(() => useSpecStore());

    const mockView = {
      id: '123',
      name: 'Test View',
      sorting: [],
      columnVisibility: { id: false },
      globalFilter: 'test'
    };

    expect(result.current.getSavedViews('test-api', '/users')).toHaveLength(0);

    act(() => {
      result.current.addSavedView('test-api', '/users', mockView);
    });

    const views = result.current.getSavedViews('test-api', '/users');
    expect(views).toHaveLength(1);
    expect(views[0].name).toBe('Test View');
    expect(views[0].columnVisibility).toEqual({ id: false });

    act(() => {
      result.current.removeSavedView('test-api', '/users', '123');
    });

    expect(result.current.getSavedViews('test-api', '/users')).toHaveLength(0);
  });
});
