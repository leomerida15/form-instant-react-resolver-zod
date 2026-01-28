import { FieldMetadata } from '@form-instant/react-input-mapping';
import { ReactNode } from 'react';
export type ZodSchema = any;
export type ComponentMapping = Record<string, React.ComponentType<any>>;
export type SchemaPath = string;
export type PathSegment = string;
export type FieldConfig<Ob, K extends keyof Ob = keyof Ob> = {
    fieldType: K;
} & Ob[K];
export interface SchemaMetadata {
    fields: Record<string, FieldMetadata>;
    paths: SchemaPath[];
    structure: Record<string, any>;
}
export interface MappingConfig {
    componentMapping: ComponentMapping;
    defaultComponent?: React.ComponentType<any>;
    transformProps?: (props: any) => any;
}
export interface SchemaMappingResult {
    schema: ZodSchema;
    metadata: SchemaMetadata;
    mappingConfig: MappingConfig;
}
export interface SchemaNavigationResult {
    navigate: (path: SchemaPath) => FieldMetadata | null;
    getField: (path: SchemaPath) => FieldMetadata | null;
    getPaths: () => SchemaPath[];
    hasPath: (path: SchemaPath) => boolean;
}
export interface SchemaMetadataResult {
    metadata: SchemaMetadata;
    getField: (path: SchemaPath) => FieldMetadata | null;
    getPaths: () => SchemaPath[];
    getStructure: () => Record<string, any>;
}
export type zodResolverProps = ZodSchema;
export interface SchemaMapperProps {
    schema: ZodSchema;
    componentMapping: ComponentMapping;
    defaultComponent?: React.ComponentType<any>;
    transformProps?: (props: any) => any;
    children?: ReactNode;
}
export interface ElementProps<Schema extends Record<string, any>> {
    name: keyof Schema;
}
