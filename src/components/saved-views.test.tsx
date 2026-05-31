import { renderHook, act } from '@testing-library/react';
import { useSpecStore } from '../store/spec-store';

const SPEC_SOURCE = 'https://example.com/spec.json';

describe('useSpecStore - Favorites and Saved Views', () => {
  beforeEach(() => {
    act(() => {
      useSpecStore.setState({ specSource: SPEC_SOURCE, preferences: {} });
    });
  });

  it('should toggle favorites correctly using preferences', () => {
    const { result } = renderHook(() => useSpecStore());

    expect(result.current.preferences[SPEC_SOURCE]?.favorites).toBeUndefined();

    act(() => {
      result.current.toggleFavorite('/users');
    });

    expect(result.current.preferences[SPEC_SOURCE]?.favorites).toContain('/users');

    act(() => {
      result.current.toggleFavorite('/users');
    });

    expect(result.current.preferences[SPEC_SOURCE]?.favorites).not.toContain('/users');
  });

  it('should add and remove saved views correctly', () => {
    const { result } = renderHook(() => useSpecStore());

    const mockView = {
      id: '123',
      name: 'Test View',
      resourcePath: '/users',
      sorting: [],
      columnVisibility: { id: false },
      globalFilter: 'test',
    };

    expect(result.current.preferences[SPEC_SOURCE]?.savedViews ?? []).toHaveLength(0);

    act(() => {
      result.current.saveView(mockView);
    });

    const views = result.current.preferences[SPEC_SOURCE]?.savedViews ?? [];
    expect(views).toHaveLength(1);
    expect(views[0].name).toBe('Test View');
    expect(views[0].columnVisibility).toEqual({ id: false });

    act(() => {
      result.current.deleteView('123');
    });

    expect(result.current.preferences[SPEC_SOURCE]?.savedViews ?? []).toHaveLength(0);
  });
});
