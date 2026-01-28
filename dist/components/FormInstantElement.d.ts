export type NestedKeys<T> = {
    [K in keyof T]: T[K] extends Record<string, any> ? K | `${K & string}.${keyof T[K] & string}` : K;
}[keyof T];
export interface ElementProps<S extends Record<string, any>> {
    name: NestedKeys<S>;
}
export declare const FormInstantElement: <S extends Record<string, any>>({ name }: ElementProps<S>) => import("react/jsx-runtime").JSX.Element;
