import { useContext } from "use-context-selector";
import { ZodEffects, ZodObject } from "zod";
import { ZodResolverContext } from "./context";
import { parseSchema } from "./funcs/schema-parser";

export const useSchema = () =>
    useContext(ZodResolverContext) as ZodObject<never, never> | ZodEffects<never, never>;

export const useFields = <S extends Record<string, any>>(key: keyof S) => {
    const S = useSchema();

    const { fields } = parseSchema(S);

    return fields[key as string];
};
