import { ResourceNode, PathItemObject, PathType, OperationObject } from './types';

const ACTION_VERBS = ['reboot', 'start', 'stop', 'restart', 'enable', 'disable', 'activate', 'deactivate', 'cancel', 'approve', 'reject', 'publish', 'unpublish', 'archive', 'restore', 'reset', 'verify', 'send', 'resend'];

function classifyPath(path: string, methods: string[]): PathType {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'singleton';
  
  const lastSegment = segments[segments.length - 1];
  const isLastParam = lastSegment?.startsWith('{');
  const hasParentParam = segments.some((s, i) => s.startsWith('{') && i < segments.length - 1);
  
  // Single segment, not a param -> root resource (e.g., /users)
  if (segments.length === 1 && !isLastParam) return 'root-resource';
  
  // /users/{id} -> singleton (detail view)
  if (segments.length === 2 && isLastParam) return 'singleton';
  
  // Has a parent param and last segment is not a param -> sub-resource or action
  if (hasParentParam && !isLastParam) {
    // If only POST method and likely an action (reboot, start, stop, etc.)
    if (methods.length === 1 && methods[0] === 'post' && ACTION_VERBS.some(v => lastSegment?.toLowerCase().includes(v))) {
      return 'action';
    }
    return 'sub-resource';
  }
  
  return 'sub-resource';
}

function getResourceName(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  if (!lastSegment) return path;
  
  // If last segment is a param, use second to last
  if (lastSegment.startsWith('{')) {
    const parent = segments[segments.length - 2];
    return parent ? toTitleCase(parent) : lastSegment;
  }
  
  return toTitleCase(lastSegment);
}

function toTitleCase(str: string): string {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function getPathParent(path: string): string | undefined {
  const segments = path.split('/').filter(Boolean);
  if (segments.length <= 1) return undefined;
  
  // Find the parent path (up to and including the last param segment)
  for (let i = segments.length - 2; i >= 0; i--) {
    if (!segments[i].startsWith('{')) {
      return '/' + segments.slice(0, i + 1).join('/');
    }
  }
  return undefined;
}

export function buildResourceTree(paths: Record<string, PathItemObject>): ResourceNode[] {
  const nodes = new Map<string, ResourceNode>();
  
  // First pass: create all nodes
  for (const [path, pathItem] of Object.entries(paths)) {
    const methods = ['get', 'post', 'put', 'patch', 'delete'].filter(
      (m) => m in pathItem
    );
    
    const operations: Record<string, OperationObject> = {};
    for (const method of methods) {
      const op = pathItem[method as keyof PathItemObject] as OperationObject | undefined;
      if (op) operations[method] = op;
    }
    
    if (operations['get']?.['x-pathform-hidden'] && methods.length === 1) continue;
    
    const type = classifyPath(path, methods);
    const name = getResourceName(path);
    const id = path.replace(/[{}\/]/g, '_').replace(/^_/, '');
    
    const node: ResourceNode = {
      id,
      name,
      path,
      type,
      methods,
      operations,
      children: [],
      parentPath: getPathParent(path),
    };
    
    nodes.set(path, node);
  }
  
  // Second pass: build tree structure
  const roots: ResourceNode[] = [];
  
  for (const node of nodes.values()) {
    if (!node.parentPath) {
      roots.push(node);
      continue;
    }
    
    // Try to find direct parent
    const parent = nodes.get(node.parentPath);
    if (parent) {
      parent.children.push(node);
    } else {
      // Look for a parent resource collection (e.g., /users for /users/{id}/posts)
      const pathSegments = node.path.split('/').filter(Boolean);
      let placed = false;
      
      for (let i = pathSegments.length - 2; i >= 0; i--) {
        const candidate = '/' + pathSegments.slice(0, i + 1).join('/');
        const candidateNode = nodes.get(candidate);
        if (candidateNode) {
          candidateNode.children.push(node);
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        roots.push(node);
      }
    }
  }
  
  // Sort: root-resources first, then sub-resources, then actions
  const typeOrder: Record<PathType, number> = {
    'root-resource': 0,
    'singleton': 1,
    'sub-resource': 2,
    'action': 3,
  };
  
  function sortNodes(nodesToSort: ResourceNode[]): ResourceNode[] {
    return nodesToSort
      .sort((a, b) => typeOrder[a.type] - typeOrder[b.type] || a.name.localeCompare(b.name))
      .map((n) => ({ ...n, children: sortNodes(n.children) }));
  }
  
  return sortNodes(roots);
}
