/// <reference types="react" />
import { zodResolverProps } from '../types';
import { NestedKeys } from './FormInstantElement';
import { FieldMetadata } from '@form-instant/react-input-mapping';
interface ZodResolverContextType {
    fields: Record<string, FieldMetadata>;
    schema: zodResolverProps;
}
export declare const ZodResolverContext: import("react").Context<ZodResolverContextType | null>;
export declare const FormInstantProvider: FCC<{
    schema: zodResolverProps;
}>;
interface useFieldsProps<Sc extends Record<string, any>> {
    key: NestedKeys<Sc>;
}
/**
 * Hook to get a specific field by name from the schema
 */
export declare const useFields: <Sc extends Record<string, any>>({ key }: useFieldsProps<Sc>) => FieldMetadata;
export {};
