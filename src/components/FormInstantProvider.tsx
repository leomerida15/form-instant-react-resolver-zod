'use client';

import { createContext, useContext } from 'react';
import { zodResolverProps } from '../types';
import { parseSchema } from '../utils/schemaParser';

export const ZodResolverContext = createContext<zodResolverProps | null>(null);

export const FormInstantProvider: FCC<{
    schema: zodResolverProps;
}> = ({ children, schema }) => {
    return <ZodResolverContext.Provider value={schema}>{children}</ZodResolverContext.Provider>;
};

/**
 * Hook to get a specific field by name from the schema
 */
export const useFields = <Sc extends Record<string, any>>(key: keyof Sc) => {
    const schema = useContext(ZodResolverContext);
    if (!schema) {
        throw new Error('useFields must be used within FormInstantProvider');
    }

    const { fields } = parseSchema(schema);
    return fields[key as string];
};
