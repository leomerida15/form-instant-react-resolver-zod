import { useMemo } from 'react';
import { ZodSchema, FieldMetadata, SchemaMetadataResult } from '../types';
import { parseSchema } from '../utils/schemaParser';
import { resolvePath } from '../utils/pathResolver';

/**
 * Hook for schema metadata functionality
 * Provides utilities for extracting and working with schema metadata
 */
export function useSchemaMetadata(schema: ZodSchema): SchemaMetadataResult {
    const metadata = useMemo(() => {
        return parseSchema(schema);
    }, [schema]);

    const getField = useMemo(() => {
        return (path: string): FieldMetadata | null => {
            return resolvePath(schema, path);
        };
    }, [schema]);

    const getPaths = useMemo(() => {
        return (): string[] => {
            return metadata.paths;
        };
    }, [metadata.paths]);

    const getStructure = useMemo(() => {
        return (): Record<string, any> => {
            return metadata.structure;
        };
    }, [metadata.structure]);

    return {
        metadata,
        getField,
        getPaths,
        getStructure,
    };
}

/**
 * Hook for getting field metadata by name
 */
export function useFieldMetadata(schema: ZodSchema, fieldName: string) {
    return useMemo(() => {
        const metadata = parseSchema(schema);
        return metadata.fields[fieldName] || null;
    }, [schema, fieldName]);
}

/**
 * Hook for getting all field metadata
 */
export function useAllFields(schema: ZodSchema) {
    return useMemo(() => {
        const metadata = parseSchema(schema);
        return metadata.fields;
    }, [schema]);
}

/**
 * Hook for getting schema structure
 */
export function useSchemaStructure(schema: ZodSchema) {
    return useMemo(() => {
        const metadata = parseSchema(schema);
        return metadata.structure;
    }, [schema]);
}

/**
 * Hook for getting required fields
 */
export function useRequiredFields(schema: ZodSchema) {
    return useMemo(() => {
        const metadata = parseSchema(schema);
        const requiredFields: Record<string, FieldMetadata> = {};

        Object.values(metadata.fields).forEach((field) => {
            if (field.required) {
                requiredFields[field.name] = field;
            }
        });

        return requiredFields;
    }, [schema]);
}

/**
 * Hook for getting optional fields
 */
export function useOptionalFields(schema: ZodSchema) {
    return useMemo(() => {
        const metadata = parseSchema(schema);
        const optionalFields: Record<string, FieldMetadata> = {};

        Object.values(metadata.fields).forEach((field) => {
            if (!field.required) {
                optionalFields[field.name] = field;
            }
        });

        return optionalFields;
    }, [schema]);
}
