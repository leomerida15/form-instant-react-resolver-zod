import { useMemo } from 'react';
import { useContext } from 'use-context-selector';
import { z, ZodEffects, ZodObject } from 'zod';
import { ZodResolverContext } from './context';
import { parseSchema } from './funcs/schema-parser';

const useSchemaBase = () =>
    useContext(ZodResolverContext) as ZodObject<never, never> | ZodEffects<never, never>;

export const useFields = <Sc extends Record<string, any>>(key: keyof Sc) => {
    const S = useSchemaBase();

    const { fields } = parseSchema(S);

    return fields[key as string];
};

type Data =
    | Zod.AnyZodObject
    | Zod.ZodEffects<Zod.AnyZodObject>
    | Zod.ZodDiscriminatedUnion<any, any>;

type DP = Record<string, any>;

export const generateInitialValues = <S extends Record<string, any>>(schema: Data, dp: DP): S => {
    try {
        const shape = (() => {
            if (schema._def.typeName === 'ZodEffects')
                return (schema as z.ZodEffects<any>).innerType().shape;
            if (schema._def.typeName === 'ZodObject') return (schema as z.ZodObject<any>).shape;

            const option = schema._def.optionsMap.get(dp[schema._def.discriminator]);

            console.log('option', option);

            if (!option) throw new Error('No option found');

            return option.shape;
        })();

        console.log('shape', shape);

        const initialValues: Record<string, any> = {};

        for (const key of Object.keys(shape)) {
            const fieldSchema = shape[key];
            const result = fieldSchema.safeParse(undefined);

            // Si tiene valor por defecto
            if (result.success) {
                initialValues[key] = result.data;
                continue;
            }

            // Inferir tipo para campos requeridos sin default
            if (fieldSchema._def.typeName === 'ZodString') {
                initialValues[key] = '';
            } else if (fieldSchema._def.typeName === 'ZodNumber') {
                initialValues[key] = 0;
            } else if (fieldSchema._def.typeName === 'ZodBoolean') {
                initialValues[key] = false;
            } else if (fieldSchema._def.typeName === 'ZodDate') {
                initialValues[key] = null;
            } else if (fieldSchema._def.typeName === 'ZodArray') {
                initialValues[key] = [];
            } else if (fieldSchema._def.typeName === 'ZodObject') {
                initialValues[key] = generateInitialValues(fieldSchema, dp);
            } else if (fieldSchema._def.typeName === 'ZodDiscriminatedUnion') {
                const option = fieldSchema._def.optionsMap.get(dp[fieldSchema._def.discriminator]);

                if (option) {
                    initialValues[key] = generateInitialValues(option, dp);
                } else {
                    initialValues[key] = null;
                }
            } else {
                initialValues[key] = null;
            }
        }

        console.log('initialValues build', initialValues);

        return initialValues as S;
    } catch (error) {
        console.log('🔴 initialValues error', error);

        if (error instanceof Error) {
            console.log(error.cause);
            console.log(error.message);
        }

        return {} as S;
    }
};

export const useSchema = <S extends Record<string, any>>(
    cbP: (dp: DP, preData?: Data) => Data,
    dp: DP,
) => {
    const schema = useMemo(() => cbP(dp).fieldConfig({ dp, ...cbP(dp).fieldConfig }), [cbP, dp]);

    const initialValues = useMemo(() => generateInitialValues(schema, dp) as S, [schema, dp]);
    console.log('initialValues', initialValues);

    return { schema, initialValues };
};
