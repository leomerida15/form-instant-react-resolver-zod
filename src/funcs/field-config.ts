import { z } from 'zod';
import { FieldConfig, SuperRefineFunction } from './types';
export const FIELD_CONFIG_SYMBOL = Symbol('GetFieldConfig');

declare module 'zod' {
    interface ZodType {
        fieldConfig<AdditionalRenderable = null, FieldTypes = string>(
            config: FieldConfig<AdditionalRenderable, FieldTypes>,
        ): this;
    }
}

export const extendZodWithFieldConfig = <AdditionalRenderable = null, FieldTypes = string>(
    zod: typeof z,
) => {
    (zod.ZodType.prototype as any).fieldConfig = function (
        config: FieldConfig<AdditionalRenderable, FieldTypes>,
    ) {
        this._def.fieldConfig = config;
        return this;
    };
    const originalObject = zod.object;
    zod.object = ((...args: [any]) => {
        const schema = originalObject(...args);
        (schema._def as any).default = () => ({});
        return schema;
    }) as any;
    const originalArray = zod.array;
    zod.array = ((...args: [any]) => {
        const schema = originalArray(...args);
        (schema._def as any).default = () => [];
        return schema;
    }) as any;
};

export const createZodSchemaFieldConfig =
    <AdditionalRenderable = null, FieldTypes = string>() =>
    (config: FieldConfig<AdditionalRenderable, FieldTypes>): SuperRefineFunction => {
        const refinementFunction: SuperRefineFunction = () => {
            // Do nothing.
        };

        // @ts-expect-error This is a symbol and not a real value.
        refinementFunction[FIELD_CONFIG_SYMBOL] = config;

        return refinementFunction;
    };

export function getFieldConfigInZodStack(schema: z.ZodTypeAny): FieldConfig {
    // Verifica si el esquema tiene fieldConfig directamente
    if (schema._def.fieldConfig) {
        return schema._def.fieldConfig as FieldConfig;
    }

    // Si el esquema es un ZodEffects, busca en el innerType
    if ('innerType' in schema._def) {
        return getFieldConfigInZodStack(schema._def.innerType as z.ZodAny);
    }

    // Si el esquema es un ZodEffects con un schema interno, busca en el schema
    if ('schema' in schema._def) {
        return getFieldConfigInZodStack(schema._def.schema as z.ZodAny);
    }

    // Si no se encuentra fieldConfig, retorna un objeto vacío
    return {} as FieldConfig;
}
