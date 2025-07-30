import { createContext } from 'react';
import { zodResolverProps } from './type';

export const ZodResolverContext = createContext<zodResolverProps>({} as zodResolverProps);
