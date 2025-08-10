import { useMemo } from 'react';
import { ZodSchema, ComponentMapping, MappingConfig, SchemaMappingResult } from '../types';
import { parseSchema } from '../utils/schemaParser';

/**
 * Main hook for schema mapping functionality
 * Provides schema metadata and mapping configuration for component mapping
 */
export function useSchemaMapping(
    schema: ZodSchema,
    componentMapping: ComponentMapping,
    options?: {
        defaultComponent?: React.ComponentType<any>;
        transformProps?: (props: any) => any;
    },
): SchemaMappingResult {
    const metadata = useMemo(() => {
        return parseSchema(schema);
    }, [schema]);

    const mappingConfig: MappingConfig = useMemo(() => {
        return {
            componentMapping,
            defaultComponent: options?.defaultComponent,
            transformProps: options?.transformProps,
        };
    }, [componentMapping, options?.defaultComponent, options?.transformProps]);

    return {
        schema,
        metadata,
        mappingConfig,
    };
}

/**
 * Hook for getting field information by path
 */
export function useFieldByPath(schema: ZodSchema, path: string) {
    return useMemo(() => {
        const metadata = parseSchema(schema);
        const segments = path.split('.');
        let currentField: any = null;
        let currentStructure = metadata.structure;

        for (const segment of segments) {
            if (currentStructure && currentStructure[segment]) {
                currentField = currentStructure[segment];
                currentStructure = currentField;
            } else {
                return null;
            }
        }

        return currentField;
    }, [schema, path]);
}

/**
 * Hook for getting all available paths in a schema
 */
export function useSchemaPaths(schema: ZodSchema) {
    return useMemo(() => {
        const metadata = parseSchema(schema);
        return metadata.paths;
    }, [schema]);
}

/**
 * Hook for checking if a path exists in a schema
 */
export function useHasPath(schema: ZodSchema, path: string) {
    return useMemo(() => {
        const metadata = parseSchema(schema);
        return metadata.paths.includes(path);
    }, [schema, path]);
}
