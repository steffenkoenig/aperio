import { useSpecStore } from './spec-store';
import { SavedView } from '@/lib/types';

describe('useSpecStore - Favorites and SavedViews', () => {
  beforeEach(() => {
    // Reset state before each test
    useSpecStore.setState({ favorites: [], savedViews: {} });
  });

  it('should add and remove favorites', () => {
    const { addFavorite, removeFavorite } = useSpecStore.getState();

    addFavorite('user');
    expect(useSpecStore.getState().favorites).toContain('user');

    addFavorite('pet');
    expect(useSpecStore.getState().favorites).toEqual(['user', 'pet']);

    // Should not add duplicates
    addFavorite('user');
    expect(useSpecStore.getState().favorites).toEqual(['user', 'pet']);

    removeFavorite('user');
    expect(useSpecStore.getState().favorites).toEqual(['pet']);
  });

  it('should add and remove saved views', () => {
    const { addSavedView, removeSavedView } = useSpecStore.getState();
    const path = '/pet/findByStatus';
    const view1: SavedView = { id: 'v1', name: 'View 1', sorting: [{ id: 'status', desc: true }], globalFilter: 'pending' };
    const view2: SavedView = { id: 'v2', name: 'View 2', sorting: [], globalFilter: '' };

    addSavedView(path, view1);
    expect(useSpecStore.getState().savedViews[path]).toEqual([view1]);

    addSavedView(path, view2);
    expect(useSpecStore.getState().savedViews[path]).toEqual([view1, view2]);

    removeSavedView(path, 'v1');
    expect(useSpecStore.getState().savedViews[path]).toEqual([view2]);
  });
});
