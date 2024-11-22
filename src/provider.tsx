import { FC, memo, ReactNode } from "react";
import { ZodResolverContext } from "./context";
import { zodResolverProps } from "./type";
export const FormInstantProvider: FC<{
  schema: zodResolverProps;
  children: ReactNode;
}> = memo(({ children, schema }) => {
  return (
    <ZodResolverContext.Provider value={schema}>
      {children}
    </ZodResolverContext.Provider>
  );
});
