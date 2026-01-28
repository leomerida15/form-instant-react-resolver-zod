import { z } from 'zod';
import { FieldMetadata } from '@form-instant/react-input-mapping';
/**
 * Parses a Zod schema and extracts metadata for mapping
 */
export declare function parseSchema(schema: z.ZodTypeAny): {
    fields: Record<string, FieldMetadata>;
};
/**
 * Gets the field type from a Zod schema
 */
export declare function getFieldType(schema: z.ZodTypeAny): string;
/**
 * Checks if a field is required
 */
export declare function isFieldRequired(schema: z.ZodTypeAny): boolean;
/**
 * Gets the default value for a field
 */
export declare function getDefaultValue(schema: z.ZodTypeAny): any;
