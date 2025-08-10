import { z } from 'zod';
import { FieldConfig, FieldMetadata, SchemaMetadata, SchemaPath } from '../types';

// Schema type detection using the internal type property
function getSchemaType(schema: z.ZodTypeAny): string {
    return schema._zod?.def?.type || 'unknown';
}

/**
 * Extracts fieldConfig from a Zod schema
 */
function extractFieldConfig(schema: z.ZodTypeAny) {
    const fieldConfig = (schema as any)?._fieldConfig as FieldConfig<Record<string, object>>;
    if (!fieldConfig) return undefined;

    return fieldConfig;
}

/**
 * Parses a Zod schema and extracts metadata for mapping
 */
export function parseSchema(schema: z.ZodTypeAny): SchemaMetadata {
    const fields: Record<string, FieldMetadata> = {};
    const paths: SchemaPath[] = [];
    const structure: Record<string, any> = {};

    function extractShape(schema: z.ZodTypeAny): Record<string, any> {
        // Handle ZodObject
        if (schema instanceof z.ZodObject) {
            return schema.shape;
        }

        // Handle ZodDiscriminatedUnion
        if (schema instanceof z.ZodDiscriminatedUnion) {
            // For discriminated unions, we'll use the first option as default
            const options = schema.options;
            if (options.length > 0) {
                return extractShape(options[0] as z.ZodTypeAny);
            }
        }

        return {};
    }

    function processField(
        fieldName: string,
        fieldSchema: z.ZodTypeAny,
        parentPath: string = '',
        parentStructure: Record<string, any> = structure,
    ) {
        // Extract fieldConfig from the schema
        const fieldConfig = extractFieldConfig(fieldSchema);
        const currentPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;
        const fieldType = fieldConfig?.fieldType || getSchemaType(fieldSchema);

        // Check if field is required
        const isOptional = fieldSchema instanceof z.ZodOptional;
        const hasDefault = fieldSchema instanceof z.ZodDefault;
        const isRequired = !isOptional && !hasDefault;

        // Get default value
        let defaultValue: any = undefined;
        if (hasDefault) {
            // For ZodDefault, try to get the default value
            try {
                const result = fieldSchema.safeParse(undefined);
                if (result.success) {
                    defaultValue = result.data;
                }
            } catch {
                // Could not get default value
            }
        } else {
            try {
                const result = fieldSchema.safeParse(undefined);
                if (result.success) {
                    defaultValue = result.data;
                }
            } catch {
                // Field is required, no default value
            }
        }

        // Create field metadata
        const fieldMetadata: FieldMetadata = {
            name: fieldName,
            type: fieldType,
            required: isRequired,
            defaultValue,
            path: currentPath,
            fieldConfig, // Include extracted fieldConfig
        };

        // Store field metadata by path
        fields[currentPath] = fieldMetadata;
        paths.push(currentPath);
        parentStructure[fieldName] = fieldMetadata;

        // Handle nested objects
        if (fieldSchema instanceof z.ZodObject) {
            const nestedShape = fieldSchema.shape;
            const nestedStructure: Record<string, any> = {};
            parentStructure[fieldName] = nestedStructure;

            Object.keys(nestedShape).forEach((nestedFieldName) => {
                processField(
                    nestedFieldName,
                    nestedShape[nestedFieldName],
                    currentPath,
                    nestedStructure,
                );
            });
        }

        // Handle arrays
        if (fieldSchema instanceof z.ZodArray) {
            const elementSchema = fieldSchema.element;
            if (elementSchema instanceof z.ZodObject) {
                const arrayStructure: Record<string, any> = {};
                parentStructure[fieldName] = arrayStructure;

                const elementShape = elementSchema.shape;
                Object.keys(elementShape).forEach((elementFieldName) => {
                    processField(
                        elementFieldName,
                        elementShape[elementFieldName],
                        `${currentPath}[0]`,
                        arrayStructure,
                    );
                });
            }
        }
    }

    const shape = extractShape(schema);
    Object.keys(shape).forEach((fieldName) => {
        processField(fieldName, shape[fieldName]);
    });

    return {
        fields,
        paths,
        structure,
    };
}

/**
 * Gets the field type from a Zod schema
 */
export function getFieldType(schema: z.ZodTypeAny): string {
    return getSchemaType(schema);
}

/**
 * Checks if a field is required
 */
export function isFieldRequired(schema: z.ZodTypeAny): boolean {
    const isOptional = schema instanceof z.ZodOptional;
    const hasDefault = schema instanceof z.ZodDefault;
    return !isOptional && !hasDefault;
}

/**
 * Gets the default value for a field
 */
export function getDefaultValue(schema: z.ZodTypeAny): any {
    try {
        const result = schema.safeParse(undefined);
        return result.success ? result.data : undefined;
    } catch {
        return undefined;
    }
}
