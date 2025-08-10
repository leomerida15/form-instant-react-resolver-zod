import * as React from 'react';
import { Fragment, useId } from 'react';
import { ElementMapping } from '@form-instant/react-input-mapping';
import { SchemaMapperProps, ElementProps } from '../types';
import { useSchemaMapping } from '../hooks/useSchemaMapping';

/**
 * Main component for mapping Zod schemas to React components
 * Provides an agnostic way to map schema fields to components
 */
export function SchemaMapper({
    schema,
    componentMapping,
    defaultComponent,
    transformProps,
    children,
}: SchemaMapperProps) {
    const { metadata, mappingConfig } = useSchemaMapping(schema, componentMapping, {
        defaultComponent,
        transformProps,
    });

    const id = useId();

    // If children are provided, render them with the mapping context
    if (children) {
        return (
            <SchemaMappingContext.Provider value={{ metadata, mappingConfig }}>
                {children}
            </SchemaMappingContext.Provider>
        );
    }

    // Otherwise, render all fields automatically
    return (
        <>
            {Object.values(metadata.fields).map((field) => {
                const Component =
                    componentMapping[field.path] || defaultComponent || ElementMapping;
                const props = transformProps ? transformProps(field) : field;

                if (field.type === 'ZodObject') {
                    // Handle nested objects
                    return (
                        <Fragment key={`${id}-${field.path}`}>
                            {Object.values(field).map((nestedField: any) => {
                                const NestedComponent =
                                    componentMapping[nestedField.path] ||
                                    defaultComponent ||
                                    ElementMapping;
                                const nestedProps = transformProps
                                    ? transformProps(nestedField)
                                    : nestedField;
                                return (
                                    <NestedComponent
                                        key={`${id}-${String(nestedField.path)}`}
                                        {...nestedProps}
                                    />
                                );
                            })}
                        </Fragment>
                    );
                }

                return <Component key={`${id}-${field.path}`} {...props} />;
            })}
        </>
    );
}

/**
 * Context for schema mapping
 */
const SchemaMappingContext = React.createContext<{
    metadata: any;
    mappingConfig: any;
} | null>(null);

/**
 * Hook to use schema mapping context
 */
export function useSchemaMappingContext() {
    const context = React.useContext(SchemaMappingContext);
    if (!context) {
        throw new Error('useSchemaMappingContext must be used within a SchemaMapper');
    }
    return context;
}

/**
 * Component for rendering a specific field by name
 * Maintains backward compatibility with the old Element component
 */
export function FormInstantElement<S extends Record<string, any>>({ name }: ElementProps<S>) {
    const { metadata } = useSchemaMappingContext();
    const field = metadata.fields[name as string];

    const id = useId();

    if (!field) {
        console.warn(`Field "${name as string}" not found in schema`);
        return null;
    }

    if (field.type === 'ZodObject') {
        // Handle nested objects
        return (
            <>
                {Object.values(field).map((nestedField: any) => {
                    return (
                        <Fragment key={`${id}-${String(nestedField.path || '')}`}>
                            <ElementMapping formProps={nestedField} />
                        </Fragment>
                    );
                })}
            </>
        );
    }

    return <ElementMapping formProps={field} />;
}

/**
 * Component for rendering a field by path
 */
export function SchemaField({ path }: { path: string }) {
    const { metadata, mappingConfig } = useSchemaMappingContext();
    const field = metadata.fields[path];

    if (!field) {
        console.warn(`Field at path "${path}" not found in schema`);
        return null;
    }

    const Component =
        mappingConfig.componentMapping[path] || mappingConfig.defaultComponent || ElementMapping;
    const props = mappingConfig.transformProps ? mappingConfig.transformProps(field) : field;

    return <Component {...props} />;
}
