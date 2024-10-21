import { createContext } from "use-context-selector";
import { zodResolverProps } from "./type";

export const ZodResolverContext = createContext<zodResolverProps>({} as zodResolverProps);
