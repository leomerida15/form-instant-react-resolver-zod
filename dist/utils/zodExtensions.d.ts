import { z } from 'zod';
import { FieldConfig } from '../types';
declare module 'zod' {
    interface ZodType {
        fieldConfig: <Ob extends Record<string, any>>(config: FieldConfig<Ob, keyof Ob>) => this;
        _fieldConfig?: FieldConfig<any, any>;
    }
}
declare function addFieldConfig<T extends z.ZodTypeAny>(schema: T, config: FieldConfig<any, any>): T;
export declare function extendZodWithFieldConfig(): typeof z;
export declare function getFieldConfig<T = FieldConfig<any, any>>(schema: z.ZodTypeAny): T | undefined;
export declare function setFieldConfig<T = FieldConfig<any, any>>(schema: z.ZodTypeAny, config: T): z.ZodTypeAny;
export { addFieldConfig };
