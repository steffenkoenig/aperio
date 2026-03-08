export interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, PathItemObject>;
  components?: {
    schemas?: Record<string, SchemaObject>;
    securitySchemes?: Record<string, SecuritySchemeObject>;
  };
  servers?: Array<{ url: string; description?: string }>;
  tags?: Array<{ name: string; description?: string }>;
}

export interface PathItemObject {
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  patch?: OperationObject;
  delete?: OperationObject;
  parameters?: ParameterObject[];
  summary?: string;
  description?: string;
}

export interface OperationObject {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses?: Record<string, ResponseObject>;
  security?: Array<Record<string, string[]>>;
  'x-pathform-hidden'?: boolean;
  'x-pathform-ui'?: string;
  'x-pathform-color'?: string;
}

export interface ParameterObject {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  schema?: SchemaObject;
  description?: string;
}

export interface RequestBodyObject {
  required?: boolean;
  content: Record<string, { schema?: SchemaObject }>;
  description?: string;
}

export interface ResponseObject {
  description: string;
  content?: Record<string, { schema?: SchemaObject }>;
}

export interface SchemaObject {
  type?: string;
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  required?: string[];
  enum?: unknown[];
  format?: string;
  description?: string;
  title?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: unknown;
  nullable?: boolean;
  allOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  $ref?: string;
  'x-pathform-hidden'?: boolean;
  'x-pathform-ui'?: string;
}

export interface SecuritySchemeObject {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
}

export type PathType = 'root-resource' | 'sub-resource' | 'action' | 'singleton';

export interface PathInfo {
  path: string;
  type: PathType;
  methods: string[];
  operations: Record<string, OperationObject>;
  parameters?: ParameterObject[];
  summary?: string;
  description?: string;
}

export interface ResourceNode {
  id: string;
  name: string;
  path: string;
  type: PathType;
  methods: string[];
  operations: Record<string, OperationObject>;
  children: ResourceNode[];
  parentPath?: string;
  icon?: string;
  tag?: string;
}

export interface ParsedSpec {
  raw: OpenApiSpec;
  resourceTree: ResourceNode[];
  title: string;
  version: string;
  description?: string;
  baseUrl?: string;
  tags: string[];
}

export interface AppEnvironment {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'none' | 'bearer' | 'apiKey' | 'basic';
  authValue?: string;
  authHeader?: string;
}

export interface AperioConfig {
  specUrl?: string;
  specContent?: string;
  environments: AppEnvironment[];
  activeEnvironmentId?: string;
}
