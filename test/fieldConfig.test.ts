import { describe, it, expect } from 'bun:test';
import {
    zExtended as z,
    FieldConfigOptions,
    BaseFieldConfigOptions,
    getFieldConfig,
} from '../src/utils/zodExtensions';
import { parseSchema } from '../src/utils/schemaParser';
import { FieldConfig } from 'types';

// Define field types for testing
interface FieldTypes {
    text: {
        label: string;
        placeholder?: string;
        maxLength?: number;
    };
    email: {
        label: string;
        placeholder?: string;
        validation?: {
            message?: string;
            async?: boolean;
        };
    };
    number: {
        label: string;
        min?: number;
        max?: number;
    };
}

// Custom field configuration types for testing
interface UserFieldConfig extends BaseFieldConfigOptions {
    userSpecific?: {
        minAge?: number;
        maxAge?: number;
    };
}

interface FormFieldConfig extends BaseFieldConfigOptions {
    formSpecific?: {
        step?: number;
        section?: string;
    };
}

describe('fieldConfig Extension', () => {
    it('should add fieldConfig method to basic schemas', () => {
        const stringSchema = z.string();
        expect(typeof stringSchema.fieldConfig).toBe('function');

        const numberSchema = z.number();
        expect(typeof numberSchema.fieldConfig).toBe('function');

        const booleanSchema = z.boolean();
        expect(typeof booleanSchema.fieldConfig).toBe('function');
    });

    it('should store configuration in _fieldConfig property', () => {
        const config: FieldConfigOptions<UserFieldConfig> = {
            label: 'Test Field',
            placeholder: 'Enter test value',
            userSpecific: {
                minAge: 18,
                maxAge: 100,
            },
        };

        const schema = z.string().fieldConfig(config);
        expect((schema as any)._fieldConfig).toEqual(config);
    });

    it('should work with generic types', () => {
        const userConfig: FieldConfigOptions<UserFieldConfig> = {
            label: 'User Name',
            userSpecific: {
                minAge: 18,
                maxAge: 100,
            },
        };

        const formConfig: FieldConfigOptions<FormFieldConfig> = {
            label: 'Form Field',
            formSpecific: {
                step: 1,
                section: 'personal',
            },
        };

        const userSchema = z.string().fieldConfig(userConfig);
        const formSchema = z.number().fieldConfig(formConfig);

        expect((userSchema as any)._fieldConfig.userSpecific).toBeDefined();
        expect((formSchema as any)._fieldConfig.formSpecific).toBeDefined();
    });

    it('should work with optional fields using extended constructors', () => {
        const config: FieldConfigOptions<UserFieldConfig> = {
            label: 'Optional Field',
            userSpecific: {
                minAge: 18,
            },
        };

        // Use the extended optional constructor
        const schema = z.optional(z.number().fieldConfig(config));

        expect((schema as any)._fieldConfig).toEqual(config);
    });

    it('should work with nullable fields using extended constructors', () => {
        const config: FieldConfigOptions<UserFieldConfig> = {
            label: 'Nullable Field',
            userSpecific: {
                maxAge: 100,
            },
        };

        // Use the extended nullable constructor
        const schema = z.nullable(z.string().fieldConfig(config));

        expect((schema as any)._fieldConfig).toEqual(config);
    });

    it('should work with object schemas', () => {
        const config: FieldConfigOptions<FormFieldConfig> = {
            label: 'User Object',
            formSpecific: {
                step: 1,
                section: 'user',
            },
        };

        const schema = z
            .object({
                name: z.string(),
                email: z.string().email(),
            })
            .fieldConfig(config);

        expect((schema as any)._fieldConfig).toEqual(config);
    });

    it('should work with array schemas', () => {
        const config: FieldConfigOptions<FormFieldConfig> = {
            label: 'Users Array',
            formSpecific: {
                step: 2,
                section: 'users',
            },
        };

        const schema = z.array(z.string()).fieldConfig(config);
        expect((schema as any)._fieldConfig).toEqual(config);
    });

    it('should work with nested fieldConfig calls', () => {
        const schema = z.object({
            name: z.string().fieldConfig<UserFieldConfig>({
                label: 'Name',
                userSpecific: { minAge: 18 },
            }),
            email: z
                .string()
                .email()
                .fieldConfig<UserFieldConfig>({
                    label: 'Email',
                    userSpecific: { maxAge: 100 },
                }),
        });

        const nameField = schema.shape.name;
        const emailField = schema.shape.email;

        expect((nameField as any)._fieldConfig.label).toBe('Name');
        expect((emailField as any)._fieldConfig.label).toBe('Email');
        expect((nameField as any)._fieldConfig.userSpecific.minAge).toBe(18);
        expect((emailField as any)._fieldConfig.userSpecific.maxAge).toBe(100);
    });

    it('should use default BaseFieldConfigOptions when no type is specified', () => {
        const schema = z.string().fieldConfig({
            label: 'Default Type Field',
            placeholder: 'This uses default type',
        });

        const config = (schema as any)._fieldConfig;
        expect(config.label).toBe('Default Type Field');
        expect(config.placeholder).toBe('This uses default type');
        // Should not have custom properties
        expect(config.userSpecific).toBeUndefined();
        expect(config.formSpecific).toBeUndefined();
    });

    it('should allow additional custom properties', () => {
        const schema = z.string().fieldConfig({
            label: 'Custom Field',
            customProperty: 'custom value',
            anotherCustom: 123,
        });

        const config = (schema as any)._fieldConfig;
        expect(config.customProperty).toBe('custom value');
        expect(config.anotherCustom).toBe(123);
    });

    it('should extract fieldConfig with fieldType in parseSchema', () => {
        const schema = z.object({
            name: z.string().fieldConfig<FieldConfig<FieldTypes, 'text'>>({
                fieldType: 'text',
                label: 'Name',
                placeholder: 'Enter name',
                maxLength: 50,
            }),
            email: z
                .string()
                .email()
                .fieldConfig<FieldConfig<FieldTypes, 'email'>>({
                    fieldType: 'email',
                    label: 'Email',
                    placeholder: 'Enter email',
                    validation: {
                        message: 'Invalid email',
                        async: true,
                    },
                }),
            age: z.number().fieldConfig<FieldConfig<FieldTypes, 'number'>>({
                fieldType: 'number',
                label: 'Age',
                min: 0,
                max: 120,
            }),
        });

        const metadata = parseSchema(schema);

        // Check that fieldConfig is extracted
        expect(metadata.fields.name.fieldConfig).toBeDefined();
        expect(metadata.fields.email.fieldConfig).toBeDefined();
        expect(metadata.fields.age.fieldConfig).toBeDefined();

        // Check fieldType values
        expect(metadata.fields.name.fieldConfig.fieldType).toBe('text');
        expect(metadata.fields.email.fieldConfig.fieldType).toBe('email');
        expect(metadata.fields.age.fieldConfig.fieldType).toBe('number');

        // Check other properties
        expect(metadata.fields.name.fieldConfig.label).toBe('Name');
        expect(metadata.fields.name.fieldConfig.maxLength).toBe(50);
        expect(metadata.fields.email.fieldConfig.validation.message).toBe('Invalid email');
        expect(metadata.fields.age.fieldConfig.min).toBe(0);
        expect(metadata.fields.age.fieldConfig.max).toBe(120);
    });

    it('should extract fieldConfig using getFieldConfig helper', () => {
        const config: FieldConfig<FieldTypes, 'text'> = {
            fieldType: 'text',
            label: 'Test Field',
            placeholder: 'Enter test value',
            maxLength: 100,
        };

        const schema = z.string().fieldConfig(config);
        const extractedConfig = getFieldConfig(schema);

        expect(extractedConfig).toEqual(config);
        expect(extractedConfig?.fieldType).toBe('text');
        expect(extractedConfig?.label).toBe('Test Field');
        expect(extractedConfig?.maxLength).toBe(100);
    });

    it('should handle schemas without fieldConfig', () => {
        const schema = z.object({
            name: z.string(),
            email: z.string().email(),
        });

        const metadata = parseSchema(schema);

        // Check that fieldConfig is undefined for fields without it
        expect(metadata.fields.name.fieldConfig).toBeUndefined();
        expect(metadata.fields.email.fieldConfig).toBeUndefined();
    });
});
