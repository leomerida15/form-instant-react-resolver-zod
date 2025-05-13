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
            if (schema instanceof z.ZodEffects) return schema.innerType().shape;
            if (schema instanceof z.ZodObject) return schema.shape;

            const option = schema._def.optionsMap.get(dp[schema._def.discriminator]);

            if (!option) throw new Error('No option found');

            return option.shape;
        })();

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
            if (fieldSchema instanceof z.ZodString) {
                initialValues[key] = '';
            } else if (fieldSchema instanceof z.ZodNumber) {
                initialValues[key] = 0;
            } else if (fieldSchema instanceof z.ZodBoolean) {
                initialValues[key] = false;
            } else if (fieldSchema instanceof z.ZodDate) {
                initialValues[key] = null;
            } else if (fieldSchema instanceof z.ZodArray) {
                initialValues[key] = [];
            } else if (fieldSchema instanceof z.ZodObject) {
                initialValues[key] = generateInitialValues(fieldSchema, dp);
            } else if (fieldSchema instanceof z.ZodDiscriminatedUnion) {
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

        return initialValues as S;
    } catch {
        return {} as S;
    }
};

export const useSchema = <S extends any>(cbP: (dp: DP, preData?: Data) => Data, dp: DP) => {
    const schema = useMemo(() => cbP(dp).fieldConfig({ dp, ...cbP(dp).fieldConfig }), [cbP, dp]);

    const initialValues = useMemo(() => generateInitialValues(schema, dp) as S, [schema, dp]);

    return { schema, initialValues };
};
