import { useInputMapping } from "@form-instant/react-input-mapping";
import { createElement, useId } from "react";
import { useFields } from "./useSchema";

export interface ElementProps<Schema extends Record<string, any>> {
    name: keyof Schema;
}

export const FormInstantElement = <S extends Record<string, any>>({ name }: ElementProps<S>) => {
    const InputMapping = useInputMapping();
    const field = useFields(name);

    const inputs = Object.values(field.schema!);

    const id = useId();

    return (
        <>
            {inputs.map((props) => {
                const Element = InputMapping.get(props.type);

                const { key, ...prop } = props;

                if (!Element) return null;

                return createElement(Element, { ...prop, key: `${key}-${id}` });
            })}
        </>
    );
};
