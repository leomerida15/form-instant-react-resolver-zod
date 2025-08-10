import { z } from 'zod';
import { SchemaPath, PathSegment, FieldMetadata } from '../types';

/**
 * Gets the type name from a Zod schema (Zod v4 compatible)
 */
function getTypeName(schema: z.ZodTypeAny): string {
    return schema._def?.type || 'unknown';
}

/**
 * Resolves a path in a Zod schema and returns the field metadata
 */
export function resolvePath(schema: z.ZodTypeAny, path: SchemaPath): FieldMetadata | null {
    const segments = path.split('.');
    let currentSchema: z.ZodTypeAny = schema;
    let currentPath = '';

    // Handle ZodEffects by getting the inner type
    if (getTypeName(currentSchema) === 'ZodEffects') {
        currentSchema = (currentSchema as any).innerType();
    }

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        currentPath = currentPath ? `${currentPath}.${segment}` : segment;

        // Handle array indices
        const arrayMatch = segment.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
            const arrayField = arrayMatch[1];
            const index = parseInt(arrayMatch[2]);

            if (getTypeName(currentSchema) === 'ZodObject') {
                const shape = (currentSchema as z.ZodObject<any>).shape;
                if (shape[arrayField] && getTypeName(shape[arrayField]) === 'ZodArray') {
                    currentSchema = (shape[arrayField] as z.ZodArray<any>).element;
                    continue;
                }
            }
            return null;
        }

        // Navigate to the next level
        if (getTypeName(currentSchema) === 'ZodObject') {
            const shape = (currentSchema as z.ZodObject<any>).shape;
            if (shape[segment]) {
                currentSchema = shape[segment];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    // Create field metadata
    const fieldType = getTypeName(currentSchema);
    const isRequired = !currentSchema.isOptional() && !(currentSchema._def as any)?.defaultValue;

    let defaultValue: any = undefined;
    try {
        const result = currentSchema.safeParse(undefined);
        if (result.success) {
            defaultValue = result.data;
        }
    } catch {
        // Field is required, no default value
    }

    return {
        name: segments[segments.length - 1],
        type: fieldType,
        required: isRequired,
        defaultValue,
        path: currentPath,
    };
}

/**
 * Gets all possible paths in a schema
 */
export function getAllPaths(schema: z.ZodTypeAny): SchemaPath[] {
    const paths: SchemaPath[] = [];

    function traverseSchema(currentSchema: z.ZodTypeAny, currentPath: string = '') {
        // Handle ZodEffects
        if (getTypeName(currentSchema) === 'ZodEffects') {
            currentSchema = (currentSchema as any).innerType();
        }

        if (getTypeName(currentSchema) === 'ZodObject') {
            const shape = (currentSchema as z.ZodObject<any>).shape;
            Object.keys(shape).forEach((fieldName) => {
                const fieldSchema = shape[fieldName];
                const fieldPath = currentPath ? `${currentPath}.${fieldName}` : fieldName;

                paths.push(fieldPath);

                // Recursively traverse nested objects
                if (getTypeName(fieldSchema) === 'ZodObject') {
                    traverseSchema(fieldSchema, fieldPath);
                }

                // Handle arrays of objects
                if (
                    getTypeName(fieldSchema) === 'ZodArray' &&
                    getTypeName((fieldSchema as z.ZodArray<any>).element) === 'ZodObject'
                ) {
                    traverseSchema((fieldSchema as z.ZodArray<any>).element, `${fieldPath}[0]`);
                }
            });
        }
    }

    traverseSchema(schema);
    return paths;
}

/**
 * Validates if a path exists in the schema
 */
export function hasPath(schema: z.ZodTypeAny, path: SchemaPath): boolean {
    return resolvePath(schema, path) !== null;
}

/**
 * Gets the schema at a specific path
 */
export function getSchemaAtPath(schema: z.ZodTypeAny, path: SchemaPath): z.ZodTypeAny | null {
    const segments = path.split('.');
    let currentSchema: z.ZodTypeAny = schema;

    // Handle ZodEffects
    if (getTypeName(currentSchema) === 'ZodEffects') {
        currentSchema = (currentSchema as any).innerType();
    }

    for (const segment of segments) {
        // Handle array indices
        const arrayMatch = segment.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
            const arrayField = arrayMatch[1];

            if (getTypeName(currentSchema) === 'ZodObject') {
                const shape = (currentSchema as z.ZodObject<any>).shape;
                if (shape[arrayField] && getTypeName(shape[arrayField]) === 'ZodArray') {
                    currentSchema = (shape[arrayField] as z.ZodArray<any>).element;
                    continue;
                }
            }
            return null;
        }

        // Navigate to the next level
        if (getTypeName(currentSchema) === 'ZodObject') {
            const shape = (currentSchema as z.ZodObject<any>).shape;
            if (shape[segment]) {
                currentSchema = shape[segment];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    return currentSchema;
}

/**
 * Splits a path into segments
 */
export function splitPath(path: SchemaPath): PathSegment[] {
    return path.split('.');
}

/**
 * Joins path segments into a path
 */
export function joinPath(segments: PathSegment[]): SchemaPath {
    return segments.join('.');
}
