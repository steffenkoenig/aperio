import { useSpecStore } from './spec-store';
import { ParsedSpec, AppEnvironment } from '@/lib/types';

describe('spec-store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useSpecStore.setState({
      parsedSpec: null,
      specSource: null,
      environments: [
        {
          id: 'default',
          name: 'Default',
          baseUrl: '',
          authType: 'none',
        },
      ],
      activeEnvironmentId: 'default',
      pathParams: {},
      favorites: {},
      savedViews: {},
    });
  });

  describe('Favorites', () => {
    it('should add a favorite when not present', () => {
      useSpecStore.setState({ specSource: 'test-source' });

      const { toggleFavorite } = useSpecStore.getState();
      toggleFavorite('test-slug');

      const { favorites } = useSpecStore.getState();
      expect(favorites['test-source']).toContain('test-slug');
    });

    it('should remove a favorite when already present', () => {
      useSpecStore.setState({
        specSource: 'test-source',
        favorites: { 'test-source': ['test-slug'] }
      });

      const { toggleFavorite } = useSpecStore.getState();
      toggleFavorite('test-slug');

      const { favorites } = useSpecStore.getState();
      expect(favorites['test-source']).not.toContain('test-slug');
    });

    it('should do nothing if specSource is null', () => {
      const { toggleFavorite } = useSpecStore.getState();
      toggleFavorite('test-slug');

      const { favorites } = useSpecStore.getState();
      expect(Object.keys(favorites)).toHaveLength(0);
    });
  });

  describe('Saved Views', () => {
    it('should save a new table view', () => {
      useSpecStore.setState({ specSource: 'test-source' });

      const { saveTableView } = useSpecStore.getState();
      const mockState = { sorting: [{ id: 'name', desc: false }] };
      saveTableView('/test-path', 'My View', mockState);

      const { savedViews } = useSpecStore.getState();
      expect(savedViews['test-source']['/test-path']['My View']).toEqual(mockState);
    });

    it('should delete an existing table view', () => {
      useSpecStore.setState({
        specSource: 'test-source',
        savedViews: {
          'test-source': {
            '/test-path': {
              'My View': { sorting: [] }
            }
          }
        }
      });

      const { deleteTableView } = useSpecStore.getState();
      deleteTableView('/test-path', 'My View');

      const { savedViews } = useSpecStore.getState();
      expect(savedViews['test-source']['/test-path']['My View']).toBeUndefined();
    });

    it('should do nothing if specSource is null when saving a view', () => {
      const { saveTableView } = useSpecStore.getState();
      saveTableView('/test-path', 'My View', {});

      const { savedViews } = useSpecStore.getState();
      expect(Object.keys(savedViews)).toHaveLength(0);
    });

    it('should do nothing if specSource is null when deleting a view', () => {
       const { deleteTableView } = useSpecStore.getState();
       deleteTableView('/test-path', 'My View');

       const { savedViews } = useSpecStore.getState();
       expect(Object.keys(savedViews)).toHaveLength(0);
    });
  });
});
