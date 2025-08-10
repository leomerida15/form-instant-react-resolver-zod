import { z } from 'zod';

// Base field configuration options interface
export interface BaseFieldConfigOptions {
    [key: string]: any; // Allow additional custom properties
}

// Generic field configuration options that extends the base
export type FieldConfigOptions<T = BaseFieldConfigOptions> = T & BaseFieldConfigOptions;

// Function to extend Zod globally with fieldConfig method
export function extendZodWithFieldConfig() {
    // Extend the base ZodType prototype to add fieldConfig method
    const zodTypePrototype = Object.getPrototypeOf(z.string());

    // Add fieldConfig method to all Zod schemas
    Object.defineProperty(zodTypePrototype, 'fieldConfig', {
        value: function <TConfig = BaseFieldConfigOptions>(config: FieldConfigOptions<TConfig>) {
            (this as any)._fieldConfig = config;
            return this;
        },
        writable: true,
        configurable: true,
    });

    // Create extended constructors that automatically add fieldConfig
    const extendedConstructors = {
        object: <T extends z.ZodRawShape>(shape: T) => {
            const schema = z.object(shape);
            return Object.assign(schema, {
                fieldConfig: <TConfig = BaseFieldConfigOptions>(
                    config: FieldConfigOptions<TConfig>,
                ) => {
                    (schema as any)._fieldConfig = config;
                    return schema;
                },
            });
        },
        array: <T extends z.ZodTypeAny>(element: T) => {
            const schema = z.array(element);
            return Object.assign(schema, {
                fieldConfig: <TConfig = BaseFieldConfigOptions>(
                    config: FieldConfigOptions<TConfig>,
                ) => {
                    (schema as any)._fieldConfig = config;
                    return schema;
                },
            });
        },
        string: () => {
            const schema = z.string();
            return Object.assign(schema, {
                fieldConfig: <TConfig = BaseFieldConfigOptions>(
                    config: FieldConfigOptions<TConfig>,
                ) => {
                    (schema as any)._fieldConfig = config;
                    return schema;
                },
            });
        },
        email: () => {
            const schema = z.string();
            return Object.assign(schema, {
                fieldConfig: <TConfig = BaseFieldConfigOptions>(
                    config: FieldConfigOptions<TConfig>,
                ) => {
                    (schema as any)._fieldConfig = config;
                    return schema;
                },
            });
        },
        number: () => {
            const schema = z.number();
            return Object.assign(schema, {
                fieldConfig: <TConfig = BaseFieldConfigOptions>(
                    config: FieldConfigOptions<TConfig>,
                ) => {
                    (schema as any)._fieldConfig = config;
                    return schema;
                },
            });
        },
        boolean: () => {
            const schema = z.boolean();
            return Object.assign(schema, {
                fieldConfig: <TConfig = BaseFieldConfigOptions>(
                    config: FieldConfigOptions<TConfig>,
                ) => {
                    (schema as any)._fieldConfig = config;
                    return schema;
                },
            });
        },
        date: () => {
            const schema = z.date();
            return Object.assign(schema, {
                fieldConfig: <TConfig = BaseFieldConfigOptions>(
                    config: FieldConfigOptions<TConfig>,
                ) => {
                    (schema as any)._fieldConfig = config;
                    return schema;
                },
            });
        },
        enum: <T extends [string, ...string[]]>(values: T) => {
            const schema = z.enum(values);
            return Object.assign(schema, {
                fieldConfig: <TConfig = BaseFieldConfigOptions>(
                    config: FieldConfigOptions<TConfig>,
                ) => {
                    (schema as any)._fieldConfig = config;
                    return schema;
                },
            });
        },
        union: <T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>(types: T) => {
            const schema = z.union(types);
            return Object.assign(schema, {
                fieldConfig: <TConfig = BaseFieldConfigOptions>(
                    config: FieldConfigOptions<TConfig>,
                ) => {
                    (schema as any)._fieldConfig = config;
                    return schema;
                },
            });
        },
        optional: <T extends z.ZodTypeAny>(schema: T) => {
            const optionalSchema = z.optional(schema);
            // Preserve fieldConfig from the original schema
            if ((schema as any).fieldConfig) {
                Object.assign(optionalSchema, {
                    fieldConfig: (schema as any).fieldConfig,
                    _fieldConfig: (schema as any)._fieldConfig,
                });
            } else {
                Object.assign(optionalSchema, {
                    fieldConfig: <TConfig = BaseFieldConfigOptions>(
                        config: FieldConfigOptions<TConfig>,
                    ) => {
                        (optionalSchema as any)._fieldConfig = config;
                        return optionalSchema;
                    },
                });
            }
            return optionalSchema;
        },
        nullable: <T extends z.ZodTypeAny>(schema: T) => {
            const nullableSchema = z.nullable(schema);
            // Preserve fieldConfig from the original schema
            if ((schema as any).fieldConfig) {
                Object.assign(nullableSchema, {
                    fieldConfig: (schema as any).fieldConfig,
                    _fieldConfig: (schema as any)._fieldConfig,
                });
            } else {
                Object.assign(nullableSchema, {
                    fieldConfig: <TConfig = BaseFieldConfigOptions>(
                        config: FieldConfigOptions<TConfig>,
                    ) => {
                        (nullableSchema as any)._fieldConfig = config;
                        return nullableSchema;
                    },
                });
            }
            return nullableSchema;
        },
    };

    // Create extended Zod instance
    const zExtended = {
        ...z,
        ...extendedConstructors,
    };

    return zExtended;
}

// Initialize the extended Zod instance
export const zExtended = extendZodWithFieldConfig();

// Export the extended Zod instance as the default
export { zExtended as z };

// Helper function to get field configuration from a schema
export function getFieldConfig<T = BaseFieldConfigOptions>(
    schema: z.ZodTypeAny,
): FieldConfigOptions<T> | undefined {
    return (schema as any)._fieldConfig;
}

// Helper function to set field configuration on an existing schema
export function setFieldConfig<T = BaseFieldConfigOptions>(
    schema: z.ZodTypeAny,
    config: FieldConfigOptions<T>,
): z.ZodTypeAny {
    (schema as any)._fieldConfig = config;
    return schema;
}
