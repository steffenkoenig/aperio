import { useSpecStore } from '../../store/spec-store';
import { Bookmark } from '../../lib/types';

describe('Bookmarks Zustand Store Logic', () => {
  beforeEach(() => {
    // Reset state before each test to prevent side-effects
    useSpecStore.setState({
      bookmarks: [],
      activeBookmark: null,
      pathParams: {},
    });
  });

  it('should initialize with an empty bookmarks array and null activeBookmark', () => {
    const state = useSpecStore.getState();
    expect(state.bookmarks).toEqual([]);
    expect(state.activeBookmark).toBeNull();
  });

  it('should add a bookmark to the store', () => {
    const newBookmark: Bookmark = {
      id: '1',
      name: 'Test Bookmark',
      type: 'table',
      path: '/users',
      slug: 'users',
      pathParams: { id: '123' },
      globalFilter: 'test filter',
    };

    useSpecStore.getState().addBookmark(newBookmark);

    const state = useSpecStore.getState();
    expect(state.bookmarks.length).toBe(1);
    expect(state.bookmarks[0]).toEqual(newBookmark);
  });

  it('should remove a bookmark from the store', () => {
    const mockBookmark: Bookmark = {
      id: '2',
      name: 'Delete Me',
      type: 'form',
      path: '/items',
      slug: 'items',
      pathParams: {},
    };

    useSpecStore.setState({ bookmarks: [mockBookmark] });
    expect(useSpecStore.getState().bookmarks.length).toBe(1);

    useSpecStore.getState().removeBookmark('2');
    expect(useSpecStore.getState().bookmarks.length).toBe(0);
  });

  it('should set an active bookmark', () => {
    const mockBookmark: Bookmark = {
      id: '3',
      name: 'Active Bookmark',
      type: 'table',
      path: '/settings',
      slug: 'settings',
      pathParams: {},
    };

    useSpecStore.getState().setActiveBookmark(mockBookmark);
    expect(useSpecStore.getState().activeBookmark).toEqual(mockBookmark);
  });

  it('should clear the active bookmark', () => {
    const mockBookmark: Bookmark = {
      id: '4',
      name: 'Clear Me',
      type: 'form',
      path: '/profile',
      slug: 'profile',
      pathParams: {},
    };

    useSpecStore.setState({ activeBookmark: mockBookmark });
    expect(useSpecStore.getState().activeBookmark).toEqual(mockBookmark);

    useSpecStore.getState().clearActiveBookmark();
    expect(useSpecStore.getState().activeBookmark).toBeNull();
  });
});
