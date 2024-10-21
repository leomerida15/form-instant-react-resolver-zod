"use client";
import { ZodResolverContext } from "./context";
import { zodResolverProps } from "./type";

export const Provider: FCC<{ schema: zodResolverProps }> = ({ children, schema }) => {
    return <ZodResolverContext.Provider value={schema}>{children}</ZodResolverContext.Provider>;
};
