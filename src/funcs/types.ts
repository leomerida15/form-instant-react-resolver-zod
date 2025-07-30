import { ParsedField } from '@form-instant/react-input-mapping';
import { ZodEffects, ZodObject } from 'zod';

export type ZodObjectOrWrapped = ZodObject<any, any> | ZodEffects<ZodObject<any, any>>;

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

// Simplify conditional type:
export type FieldConfig<Ob, K extends keyof Ob> = {
    fieldType: K;
} & Ob[K];
