import { ElementMapping } from '@form-instant/react-input-mapping';
import { Fragment, useId } from 'react';
import { useFields } from './useSchema';

export interface ElementProps<Schema extends Record<string, any>> {
    name: keyof Schema;
}

export const FormInstantElement = <S extends Record<string, any>>({ name }: ElementProps<S>) => {
    const field = useFields(name);

    const id = useId();

    const IndexCase = (field.fieldConfig as any)?.type ? 1 : 0;

    const Cases = [
        <ElementMapping formProps={field} />,
        <>
            {Object.values(field.schema || {}).map((props) => {
                return (
                    <Fragment key={`${id}-${props.name?.history || ''}`}>
                        <ElementMapping formProps={props} />
                    </Fragment>
                );
            })}
        </>,
    ];

    return (
        <>
            {Cases.map((Case, index) => <Fragment key={`${id}-${index}`}>{Case}</Fragment>).filter(
                (_, index) => index === IndexCase,
            )}
        </>
    );
};
