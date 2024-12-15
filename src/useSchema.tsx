import { useContext } from 'use-context-selector';
import { ZodEffects, ZodObject } from 'zod';
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

export const useSchema = (cbP: (dp: DP, preData?: Data) => Data, dp: DP) => {
    const schema = cbP(dp).fieldConfig({ dp, ...cbP(dp).fieldConfig });

    return { schema };
};
