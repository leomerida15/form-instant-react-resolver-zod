'use client';
import { ElementMapping } from '@form-instant/react-input-mapping';
import { Fragment, useId } from 'react';
import { useFields } from './FormInstantProvider';

export interface ElementProps<Schema extends Record<string, any>> {
    name: keyof Schema;
}

export const FormInstantElement = <S extends Record<string, any>>({ name }: ElementProps<S>) => {
    const field = useFields(name);

    const id = useId();

    // Map FieldMetadata to the expected format for ElementMapping
    const mappedField = {
        ...field,
        fieldType: field.type, // Map 'type' to 'fieldType'
        schema: field.fieldConfig?.schema || field.fieldConfig, // Use fieldConfig as schema
        name: {
            current: field.name,
            history: field.name,
        },
    };

    if (!['object'].includes(mappedField.fieldType))
        return <ElementMapping formProps={mappedField} />;

    return (
        <>
            {Object.values(mappedField.schema || {}).map((props: any) => {
                return (
                    <Fragment key={`${id}-${props.name?.history || ''}`}>
                        <ElementMapping formProps={props} />
                    </Fragment>
                );
            })}
        </>
    );
};
