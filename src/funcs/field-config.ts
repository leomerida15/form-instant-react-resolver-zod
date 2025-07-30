import z from 'zod';
import { FieldConfig, SuperRefineFunction } from './types';

export const FIELD_CONFIG_SYMBOL = Symbol('GetFieldConfig');

declare module 'zod' {
    interface ZodType {
        fieldConfig<Ob extends Record<string, any>>(config: FieldConfig<Ob, keyof Ob>): this;
    }
}

export const extendZodWithFieldConfig = (zod: typeof z) => {
    (zod.ZodType.prototype as any).fieldConfig = function (config: FieldConfig<any, any>) {
        this._def.fieldConfig = config;
        return this;
    };

    const { object, array, ...zodRest } = zod;

    zod = {
        object: ((...args: [any]) => {
            const schema = object(...args);
            (schema._def as any).default = () => ({});
            return schema;
        }) as any,
        array: ((...args: [any]) => {
            const schema = array(...args);
            (schema._def as any).default = () => [];
            return schema;
        }) as any,
        ...zodRest,
    };
};

export const createZodSchemaFieldConfig =
    <Ob extends Record<string, any>, K extends keyof Ob>() =>
    (config: FieldConfig<Ob, K>): SuperRefineFunction => {
        const refinementFunction: SuperRefineFunction = () => {
            // Do nothing.
        };

        // @ts-expect-error This is a symbol and not a real value.
        refinementFunction[FIELD_CONFIG_SYMBOL] = config;

        return refinementFunction;
    };

export function getFieldConfigInZodStack(schema: z.ZodTypeAny): FieldConfig<any, any> {
    // Verifica si el esquema tiene fieldConfig directamente
    if (schema._def.fieldConfig) {
        return schema._def.fieldConfig as FieldConfig<any, any>;
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
    return {} as FieldConfig<any, any>;
}
