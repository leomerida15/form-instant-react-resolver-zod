"use client";
import { FC, ReactNode } from "react";
import { ZodResolverContext } from "./context";
import { zodResolverProps } from "./type";
export const Provider: FC<{ schema: zodResolverProps; children: ReactNode }> = ({
    children,
    schema,
}) => {
    return <ZodResolverContext.Provider value={schema}>{children}</ZodResolverContext.Provider>;
};
