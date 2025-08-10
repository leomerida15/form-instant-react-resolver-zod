import { FieldConfig } from 'types';
import { z, BaseFieldConfigOptions } from '../utils/zodExtensions';

// Define field types object
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
        step?: number;
    };
    boolean: {
        label: string;
        description?: string;
    };
    select: {
        label: string;
        options: Array<{ value: string; label: string }>;
    };
}

// Custom field configuration types for different contexts
interface UserFieldConfig extends BaseFieldConfigOptions {
    dp?: Record<string, any>;
    userSpecific?: {
        minAge?: number;
        maxAge?: number;
    };
}

interface ProfileFieldConfig extends BaseFieldConfigOptions {
    profileSpecific?: {
        avatar?: boolean;
        bio?: boolean;
    };
}

interface FormFieldConfig extends BaseFieldConfigOptions {
    formSpecific?: {
        step?: number;
        section?: string;
    };
}

// Example of using fieldConfig with fieldType
export function createUserSchema() {
    return z.object({
        name: z.string().fieldConfig<FieldConfig<FieldTypes, 'text'>>({
            fieldType: 'text',
            label: 'Full Name',
            placeholder: 'Enter your full name',
            maxLength: 50,
            userSpecific: {
                minAge: 18,
                maxAge: 100,
            },
        }),
        email: z
            .string()
            .email()
            .fieldConfig<FieldConfig<FieldTypes, 'email'>>({
                fieldType: 'email',
                label: 'Email Address',
                placeholder: 'Enter your email',
                validation: {
                    message: 'Please enter a valid email',
                    async: true,
                },
                dp: { email: 'default@example.com' },
            }),
        age: z
            .number()
            .fieldConfig<FieldConfig<FieldTypes, 'number'>>({
                fieldType: 'number',
                label: 'Age',
                min: 0,
                max: 120,
                step: 1,
                userSpecific: {
                    minAge: 0,
                    maxAge: 120,
                },
            })
            .optional(),
        isActive: z.boolean().fieldConfig<FieldConfig<FieldTypes, 'boolean'>>({
            fieldType: 'boolean',
            label: 'Active Status',
            description: 'Check if user is active',
        }),
        role: z
            .enum(['admin', 'user', 'moderator'])
            .fieldConfig<FieldConfig<FieldTypes, 'select'>>({
                fieldType: 'select',
                label: 'User Role',
                options: [
                    { value: 'admin', label: 'Administrator' },
                    { value: 'user', label: 'Regular User' },
                    { value: 'moderator', label: 'Moderator' },
                ],
            }),
    });
}

// Example of using fieldConfig with different types for different contexts
export function createProfileSchema() {
    return z.object({
        user: z.object({
            profile: z.object({
                email: z
                    .string()
                    .email()
                    .fieldConfig<FieldConfig<FieldTypes, 'email'> & ProfileFieldConfig>({
                        fieldType: 'email',
                        label: 'Profile Email',
                        placeholder: 'Enter profile email',
                        dp: { email: 'default@example.com' },
                        profileSpecific: {
                            avatar: true,
                            bio: false,
                        },
                    }),
                name: z.string().fieldConfig<FieldConfig<FieldTypes, 'text'> & ProfileFieldConfig>({
                    fieldType: 'text',
                    label: 'Profile Name',
                    placeholder: 'Enter profile name',
                    dp: { name: 'Default Name' },
                    profileSpecific: {
                        avatar: false,
                        bio: true,
                    },
                }),
            }),
        }),
    });
}

// Example of using fieldConfig with form-specific configuration
export function createFormSchema() {
    return z.object({
        step1: z.object({
            firstName: z.string().fieldConfig<FieldConfig<FieldTypes, 'text'> & FormFieldConfig>({
                fieldType: 'text',
                label: 'First Name',
                placeholder: 'Enter first name',
                formSpecific: {
                    step: 1,
                    section: 'personal',
                },
            }),
            lastName: z.string().fieldConfig<FieldConfig<FieldTypes, 'text'> & FormFieldConfig>({
                fieldType: 'text',
                label: 'Last Name',
                placeholder: 'Enter last name',
                formSpecific: {
                    step: 1,
                    section: 'personal',
                },
            }),
        }),
        step2: z.object({
            email: z
                .string()
                .email()
                .fieldConfig<FieldConfig<FieldTypes, 'email'> & FormFieldConfig>({
                    fieldType: 'email',
                    label: 'Email',
                    placeholder: 'Enter email',
                    formSpecific: {
                        step: 2,
                        section: 'contact',
                    },
                }),
        }),
    });
}

// Example of using fieldConfig with arrays
export function createUsersArraySchema() {
    return z.object({
        users: z
            .array(
                z.object({
                    name: z
                        .string()
                        .fieldConfig<FieldConfig<FieldTypes, 'text'> & UserFieldConfig>({
                            fieldType: 'text',
                            label: 'User Name',
                            placeholder: 'Enter user name',
                            userSpecific: {
                                minAge: 18,
                            },
                        }),
                    email: z
                        .string()
                        .email()
                        .fieldConfig<FieldConfig<FieldTypes, 'email'> & UserFieldConfig>({
                            fieldType: 'email',
                            label: 'User Email',
                            placeholder: 'Enter user email',
                            dp: { email: 'user@example.com' },
                        }),
                }),
            )
            .fieldConfig<FormFieldConfig>({
                label: 'Users List',
                description: 'List of users',
                formSpecific: {
                    step: 3,
                    section: 'users',
                },
            }),
    });
}

// Example of getting field configuration with proper typing
export function getFieldConfiguration() {
    const schema = createUserSchema();
    const nameField = schema.shape.name;

    // Get the field configuration with proper typing
    const nameConfig = (nameField as any)._fieldConfig as FieldConfig<FieldTypes, 'text'> &
        UserFieldConfig;
    console.log('Name field config:', nameConfig);

    // TypeScript will now provide proper autocompletion for fieldType and userSpecific properties
    console.log('Field type:', nameConfig.fieldType); // 'text'
    if (nameConfig.userSpecific) {
        console.log('Min age:', nameConfig.userSpecific.minAge);
        console.log('Max age:', nameConfig.userSpecific.maxAge);
    }

    return nameConfig;
}

// Example of using fieldConfig with legacy compatibility (using base type)
export function legacyCompatibilityExample() {
    const schema = z
        .object({
            name: z.string(),
        })
        .fieldConfig<BaseFieldConfigOptions>({
            label: 'Legacy Form',
            description: 'This uses the base configuration type',
        });

    return schema;
}

// Example of using fieldConfig without specifying a type (uses default BaseFieldConfigOptions)
export function defaultTypeExample() {
    return z.object({
        simpleField: z.string().fieldConfig({
            label: 'Simple Field',
            placeholder: 'This uses the default type',
        }),
    });
}
