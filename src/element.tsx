import { useId } from "react";
import { useInputMapping } from "../../InputMapping/useInputMapping";
import { useFields } from "./useSchema";

interface ElementProps<Schema extends Record<string, any>> {
    name: keyof Schema;
}

export const Element = <S extends Record<string, any>>({ name }: ElementProps<S>) => {
    const inputMapping = useInputMapping();
    const field = useFields(name);

    const inputs = Object.values(field.schema!);

    const id = useId();

    return (
        <>
            {inputs.map((props) => {
                const Element = inputMapping.get(props.type)!;

                const { key, ...prop } = props;

                return <Element {...prop} key={`${key}-${id}`} />;
            })}
        </>
    );
};
