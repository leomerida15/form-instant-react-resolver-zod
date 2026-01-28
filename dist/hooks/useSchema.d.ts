import { z } from 'zod';
type Data = z.ZodObject<any, any> | z.ZodTypeAny | z.ZodDiscriminatedUnion<any, any>;
type DP = Record<string, any>;
/**
 * Generates initial values from schema and dependencies
 */
export declare const getInitialValues: <T extends Data>(schema: T, dp?: DP) => z.core.output<T>;
/**
 * Hook that provides reactive schema and initial values
 */
export declare const useSchema: <T extends Data>(cbP: (dp: DP, preData?: Data) => T, dp: DP) => {
    readonly schema: T;
    readonly initialValues: z.core.output<T>;
};
export {};
