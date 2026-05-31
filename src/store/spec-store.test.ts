import { useSpecStore } from './spec-store';
import { ParsedSpec, SavedView } from '../lib/types';

describe('useSpecStore - Favorites and Saved Views', () => {
  const dummySpec: ParsedSpec = {
    raw: { openapi: '3.0.0', info: { title: 'Test', version: '1' }, paths: {} },
    resourceTree: [],
    title: 'Test',
    version: '1',
    tags: []
  };

  beforeEach(() => {
    useSpecStore.setState({
      parsedSpec: null,
      specSource: null,
      environments: [],
      activeEnvironmentId: 'default',
      pathParams: {},
      preferences: {}
    });
  });

  it('should toggle favorites correctly', () => {
    useSpecStore.getState().setParsedSpec(dummySpec, 'https://example.com/spec.json');

    // Initial state
    expect(useSpecStore.getState().preferences['https://example.com/spec.json']?.favorites).toBeUndefined();

    // Toggle on
    useSpecStore.getState().toggleFavorite('/users');
    expect(useSpecStore.getState().preferences['https://example.com/spec.json'].favorites).toContain('/users');

    // Toggle off
    useSpecStore.getState().toggleFavorite('/users');
    expect(useSpecStore.getState().preferences['https://example.com/spec.json'].favorites).not.toContain('/users');
  });

  it('should not throw when toggling favorite without a specSource', () => {
    // specSource is null in the initial state
    expect(() => useSpecStore.getState().toggleFavorite('/users')).not.toThrow();
    expect(useSpecStore.getState().preferences).toEqual({});
  });

  it('should not throw when saving view without a specSource', () => {
    const view: SavedView = {
      id: 'v1',
      name: 'Test',
      resourcePath: '/users',
      columnVisibility: {},
      globalFilter: '',
      sorting: []
    };
    expect(() => useSpecStore.getState().saveView(view)).not.toThrow();
    expect(useSpecStore.getState().preferences).toEqual({});
  });

  it('should update an existing view when saving with same id', () => {
    useSpecStore.getState().setParsedSpec(dummySpec, 'https://example.com/spec.json');

    const view: SavedView = {
      id: 'v1',
      name: 'Original',
      resourcePath: '/users',
      columnVisibility: {},
      globalFilter: '',
      sorting: []
    };

    useSpecStore.getState().saveView(view);
    useSpecStore.getState().saveView({ ...view, name: 'Updated' });

    const views = useSpecStore.getState().preferences['https://example.com/spec.json'].savedViews;
    expect(views).toHaveLength(1);
    expect(views[0].name).toBe('Updated');
  });

  it('should save and delete custom views correctly', () => {
    useSpecStore.getState().setParsedSpec(dummySpec, 'https://example.com/spec.json');

    const view: SavedView = {
      id: 'v1',
      name: 'Test View',
      resourcePath: '/users',
      columnVisibility: { email: false },
      globalFilter: 'test',
      sorting: []
    };

    // Save view
    useSpecStore.getState().saveView(view);
    expect(useSpecStore.getState().preferences['https://example.com/spec.json'].savedViews).toHaveLength(1);
    expect(useSpecStore.getState().preferences['https://example.com/spec.json'].savedViews[0]).toEqual(view);

    // Delete view
    useSpecStore.getState().deleteView('v1');
    expect(useSpecStore.getState().preferences['https://example.com/spec.json'].savedViews).toHaveLength(0);
  });
});
