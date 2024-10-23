import { ZodDiscriminatedUnion, ZodEffects, ZodObject } from 'zod';

export type zodResolverProps =
    | ZodObject<any, any>
    | ZodEffects<any, any>
    | ZodDiscriminatedUnion<any, any>;
