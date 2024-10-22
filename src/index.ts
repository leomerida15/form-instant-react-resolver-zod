import { FieldConfig } from "@form-instant/react-input-mapping";
import { SuperRefineFunction } from "./funcs/types";

export { Element as FormInstantElement } from "./element";
export { Provider as FormInstantProvider } from "./provider";
export * from "./type";
export { useFields, useSchema } from "./useSchema";
export const createZodSchemaFieldConfig =
    <AdditionalRenderable = null, FieldTypes = string>() =>
    (config: FieldConfig<AdditionalRenderable, FieldTypes>): SuperRefineFunction => {
        const refinementFunction: SuperRefineFunction = () => {
            // Do nothing.
        };

        // @ts-expect-error This is a symbol and not a real value.
        refinementFunction[FIELD_CONFIG_SYMBOL] = config;

        return refinementFunction;
    };
