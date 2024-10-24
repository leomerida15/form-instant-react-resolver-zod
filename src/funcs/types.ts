import { ZodEffects, ZodObject } from 'zod';

export type ZodObjectOrWrapped = ZodObject<any, any> | ZodEffects<ZodObject<any, any>>;

export interface ParsedField<AdditionalRenderable, FieldTypes = string> {
    key: string;
    type: string;
    required: boolean;
    default?: any;
    fieldConfig?: FieldConfig<AdditionalRenderable, FieldTypes>;

    // Field-specific
    options?: [string, string][]; // [value, label] for enums
    schema?: ParsedField<AdditionalRenderable, FieldTypes>[]; // For objects and arrays
}

export interface ParsedSchema<AdditionalRenderable = null, FieldTypes = string> {
    fields: Record<string, ParsedField<AdditionalRenderable, FieldTypes>>;
}

export type SuperRefineFunction = () => unknown;

export type Renderable<AdditionalRenderable = null> =
    | string
    | number
    | boolean
    | null
    | undefined
    | AdditionalRenderable;

export type FieldConfig<AdditionalRenderable = object, FieldTypes = string> = {
    fieldType?: FieldTypes;
} & AdditionalRenderable;
