import { Element } from "./element";
import { fieldConfig } from "./funcs/field-config";
import { FieldConfig } from "./funcs/types";
import { Provider } from "./provider";
import { useFields, useSchema } from "./useSchema";
export * from "./type";

export const ZodSchemaResolver = <AdditionalRenderable = null, FieldTypes = string>() => ({
    useSchema,
    useFields,
    fieldConfig: (config: FieldConfig<AdditionalRenderable, FieldTypes>) =>
        fieldConfig<AdditionalRenderable, FieldTypes>(config),
    FormInstantProvider: Provider,
    FormInstantElement: Element,
});
