import { useContext, useMemo } from 'react';
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

type Data = z.AnyZodObject | z.ZodEffects<z.AnyZodObject> | z.ZodDiscriminatedUnion<any, any>;

type DP = Record<string, any>;

export const generateInitialValues = <S extends Record<string, any>>(schema: Data, dp: DP): S => {
    try {
        const shape = (() => {
            if (schema._def.typeName === 'ZodEffects')
                return (schema as z.ZodEffects<any>).innerType().shape;
            if (schema._def.typeName === 'ZodObject') return (schema as z.ZodObject<any>).shape;

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

            if (Object.keys(dp).includes(key)) {
                initialValues[key] = dp[key];
                continue;
            }
            // Inferir tipo para campos requeridos sin default
            const fieldConfig = {
                ZodString() {
                    initialValues[key] = '';
                },
                ZodNumber() {
                    initialValues[key] = 0;
                },
                ZodBoolean() {
                    initialValues[key] = false;
                },
                ZodDate() {
                    initialValues[key] = null;
                },
                ZodArray() {
                    initialValues[key] = [];
                },
                ZodObject() {
                    initialValues[key] = generateInitialValues(fieldSchema, dp);
                },
                ZodDiscriminatedUnion() {
                    const option = fieldSchema._def.optionsMap.get(
                        dp[fieldSchema._def.discriminator],
                    );

                    if (option) {
                        initialValues[key] = generateInitialValues(option, dp);
                    } else {
                        initialValues[key] = null;
                    }
                },
            };

            const fieldType = fieldSchema._def.typeName;
            const fieldHandler = fieldConfig[fieldType as keyof typeof fieldConfig];

            if (fieldHandler) {
                fieldHandler();
                continue;
            }

            initialValues[key] = null;
        }

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
    const schema = useMemo(
        () => (cbP(dp) as any).fieldConfig({ dp, ...cbP(dp).fieldConfig }),
        [cbP, JSON.stringify(dp)],
    );

    const initialValues = useMemo(
        () => generateInitialValues(schema, dp) as S,
        [schema, JSON.stringify(dp)],
    );

    return { schema, initialValues };
};
