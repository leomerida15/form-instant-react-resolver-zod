import { ElementMapping } from '@form-instant/react-input-mapping';
import { Fragment, useId } from 'react';
import { useFields } from './useSchema';

export interface ElementProps<Schema extends Record<string, any>> {
    name: keyof Schema;
}

export const FormInstantElement = <S extends Record<string, any>>({ name }: ElementProps<S>) => {
    const field = useFields(name);

    const id = useId();

    if (Object.keys(field.fieldConfig).length) return <ElementMapping formProps={field} />;

    return (
        <>
            {Object.values(field.schema || {}).map((props) => {
                return (
                    <Fragment key={`${id}-${props.name?.history || ''}`}>
                        <ElementMapping formProps={props} />
                    </Fragment>
                );
            })}
        </>
    );
};
