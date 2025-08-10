import { useMemo } from 'react';
import { ZodSchema, SchemaPath, FieldMetadata, SchemaNavigationResult } from '../types';
import { resolvePath, getAllPaths, hasPath } from '../utils/pathResolver';

/**
 * Hook for schema navigation functionality
 * Provides utilities for navigating through schema structures using dot notation paths
 */
export function useSchemaNavigation(schema: ZodSchema): SchemaNavigationResult {
    const paths = useMemo(() => {
        return getAllPaths(schema);
    }, [schema]);

    const navigate = useMemo(() => {
        return (path: SchemaPath): FieldMetadata | null => {
            return resolvePath(schema, path);
        };
    }, [schema]);

    const getField = useMemo(() => {
        return (path: SchemaPath): FieldMetadata | null => {
            return resolvePath(schema, path);
        };
    }, [schema]);

    const getPaths = useMemo(() => {
        return (): SchemaPath[] => {
            return paths;
        };
    }, [paths]);

    const hasPathFn = useMemo(() => {
        return (path: SchemaPath): boolean => {
            return hasPath(schema, path);
        };
    }, [schema]);

    return {
        navigate,
        getField,
        getPaths,
        hasPath: hasPathFn,
    };
}

/**
 * Hook for getting a specific field by path
 */
export function useField(schema: ZodSchema, path: SchemaPath) {
    return useMemo(() => {
        return resolvePath(schema, path);
    }, [schema, path]);
}

/**
 * Hook for getting all paths in a schema
 */
export function usePaths(schema: ZodSchema) {
    return useMemo(() => {
        return getAllPaths(schema);
    }, [schema]);
}

/**
 * Hook for checking if a path exists
 */
export function usePathExists(schema: ZodSchema, path: SchemaPath) {
    return useMemo(() => {
        return hasPath(schema, path);
    }, [schema, path]);
}
