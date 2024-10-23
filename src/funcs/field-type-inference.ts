import { z } from 'zod';
import { FieldConfig } from './types';

export function inferFieldType(schema: z.ZodTypeAny, fieldType?: FieldConfig['fieldType']): string {
    if (fieldType) {
        return fieldType;
    }

    const type = schema._def.typeName;

    const zodToInputType = new Map([
        ['ZodObject', 'object'],
        ['ZodString', 'string'],
        ['ZodNumber', 'number'],
        ['ZodBoolean', 'boolean'],
        ['ZodDate', 'date'],
        ['ZodEnum', 'select'],
        ['ZodNativeEnum', 'select'],
        ['ZodArray', 'array'],
    ]);

    const match = zodToInputType.get(type);

    return match || 'string'; // Default to string for unknown types
}
