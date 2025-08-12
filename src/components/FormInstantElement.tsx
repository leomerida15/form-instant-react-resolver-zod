'use client';

import { Fragment, useId } from 'react';
import { ElementMapping } from '@form-instant/react-input-mapping';
import { useFields } from './FormInstantProvider';

export interface ElementProps<Schema extends Record<string, any>> {
  name: keyof Schema;
}

export const FormInstantElement = <S extends Record<string, any>>({ name }: ElementProps<S>) => {
  const field = useFields(name);

  console.log('field', field);

  const id = useId();

  if (!['object'].includes(field.fieldType)) return <ElementMapping formProps={field} />;

  return (
    <>
      {Object.values(field.schema || {}).map((props: any) => {
        return (
          <Fragment key={`${id}-${props.name?.history || ''}`}>
            <ElementMapping formProps={props} />
          </Fragment>
        );
      })}
    </>
  );
};
