# Technical Architecture

## Schema Resolution
Our local state tree maintains a real-time parsed replica of the source OpenAPI spec.

For `ResourceForm` validation rules, `schema-resolver.ts` is responsible for traversing the nested object constraints and hydrating `#/$ref` pointers into concrete schema objects.

### Arrays and Tuples
As of Version 0.1.1, the `resolveSchema` method explicitly traverses down into array `items` definitions. This allows the `@rjsf/core` view engine to construct inline sub-forms for complex arrays.

**Tuple handling**: If a schema defines `items` as an Array (representing a tuple with heterogeneous positional schemas), the resolver maps over each item individually to resolve its $refs, preserving the exact multi-type definition for downstream RJSF rendering.
