import React, { useState, FormEvent } from 'react';
import { z } from '../utils/zodExtensions';
import { FieldConfig } from '../types';
import {
    FormInstantProvider,
    FormInstantElementV2 as FormInstantElement,
    FormInstantField,
    FormInstantForm,
    useFields,
    useSchema,
} from '../components/FormInstantProvider';
import { ElementMapping } from '@form-instant/react-input-mapping';

// Define field types for our form components
interface FieldTypes {
    text: {
        label: string;
        placeholder?: string;
        maxLength?: number;
        required?: boolean;
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
        placeholder?: string;
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
        placeholder?: string;
        options: Array<{ value: string; label: string }>;
    };
    textarea: {
        label: string;
        placeholder?: string;
        rows?: number;
        maxLength?: number;
    };
}

// Custom field configuration for user forms
interface UserFieldConfig {
    userSpecific?: {
        minAge?: number;
        maxAge?: number;
    };
    dp?: Record<string, any>;
}

// React components for different field types
const TextInput: React.FC<any> = ({
    label,
    placeholder,
    maxLength,
    required,
    name,
    path,
    ...props
}) => (
    <div className="form-field">
        <label htmlFor={name} className="form-label">
            {label}
            {required && <span className="required">*</span>}
        </label>
        <input
            type="text"
            id={name}
            name={name}
            placeholder={placeholder}
            maxLength={maxLength}
            className="form-input"
            {...props}
        />
        {props.fieldConfig?.userSpecific && (
            <div className="field-info">
                Age range: {props.fieldConfig.userSpecific.minAge} -{' '}
                {props.fieldConfig.userSpecific.maxAge}
            </div>
        )}
    </div>
);

const EmailInput: React.FC<any> = ({ label, placeholder, validation, name, ...props }) => (
    <div className="form-field">
        <label htmlFor={name} className="form-label">
            {label}
            <span className="required">*</span>
        </label>
        <input
            type="email"
            id={name}
            name={name}
            placeholder={placeholder}
            className="form-input"
            {...props}
        />
        {validation?.message && <div className="validation-message">{validation.message}</div>}
        {validation?.async && <div className="async-validation">Validating...</div>}
    </div>
);

const NumberInput: React.FC<any> = ({ label, placeholder, min, max, step, name, ...props }) => (
    <div className="form-field">
        <label htmlFor={name} className="form-label">
            {label}
        </label>
        <input
            type="number"
            id={name}
            name={name}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="form-input"
            {...props}
        />
    </div>
);

const CheckboxInput: React.FC<any> = ({ label, description, name, ...props }) => (
    <div className="form-field checkbox">
        <label className="checkbox-label">
            <input type="checkbox" name={name} className="form-checkbox" {...props} />
            <span className="checkbox-text">{label}</span>
        </label>
        {description && <div className="field-description">{description}</div>}
    </div>
);

const SelectInput: React.FC<any> = ({ label, placeholder, options, name, ...props }) => (
    <div className="form-field">
        <label htmlFor={name} className="form-label">
            {label}
        </label>
        <select id={name} name={name} className="form-select" {...props}>
            {placeholder && (
                <option value="" disabled>
                    {placeholder}
                </option>
            )}
            {options.map((option: any) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

const TextareaInput: React.FC<any> = ({ label, placeholder, rows, maxLength, name, ...props }) => (
    <div className="form-field">
        <label htmlFor={name} className="form-label">
            {label}
        </label>
        <textarea
            id={name}
            name={name}
            placeholder={placeholder}
            rows={rows || 3}
            maxLength={maxLength}
            className="form-textarea"
            {...props}
        />
    </div>
);

// Component mapping based on fieldType
const componentMapping: Record<string, React.ComponentType<any>> = {
    text: TextInput,
    email: EmailInput,
    number: NumberInput,
    boolean: CheckboxInput,
    select: SelectInput,
    textarea: TextareaInput,
};

// Transform props to include fieldConfig information
const transformProps = (field: any) => {
    const baseProps = {
        name: field.name,
        path: field.path,
        required: field.required,
        defaultValue: field.defaultValue,
    };

    // If field has fieldConfig, merge it with base props
    if (field.fieldConfig) {
        return {
            ...baseProps,
            ...field.fieldConfig,
            fieldConfig: field.fieldConfig, // Keep original fieldConfig for reference
        };
    }

    return baseProps;
};

// Example 1: Using FormInstantProvider with legacy signature (cbP and dp)
export function UserFormExample1() {
    const dp = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        isActive: true,
        role: 'user',
        bio: 'Software developer',
    };

    // Schema creation function that matches legacy cbP signature
    const createUserSchema = (dp: Record<string, any>) =>
        z.object({
            name: z.string().fieldConfig<FieldConfig<FieldTypes, 'text'> & UserFieldConfig>({
                fieldType: 'text',
                label: 'Full Name',
                placeholder: 'Enter your full name',
                maxLength: 50,
                required: true,
                userSpecific: {
                    minAge: 18,
                    maxAge: 100,
                },
            }),
            email: z
                .string()
                .email()
                .fieldConfig<FieldConfig<FieldTypes, 'email'> & UserFieldConfig>({
                    fieldType: 'email',
                    label: 'Email Address',
                    placeholder: 'Enter your email',
                    validation: {
                        message: 'Please enter a valid email address',
                        async: true,
                    },
                    dp: { email: dp.email || 'default@example.com' },
                }),
            age: z
                .number()
                .fieldConfig<FieldConfig<FieldTypes, 'number'> & UserFieldConfig>({
                    fieldType: 'number',
                    label: 'Age',
                    placeholder: 'Enter your age',
                    min: 0,
                    max: 120,
                    step: 1,
                    userSpecific: {
                        minAge: 0,
                        maxAge: 120,
                    },
                })
                .optional(),
            isActive: z
                .boolean()
                .fieldConfig<FieldConfig<FieldTypes, 'boolean'> & UserFieldConfig>({
                    fieldType: 'boolean',
                    label: 'Active Status',
                    description: 'Check if user is active',
                }),
            role: z
                .enum(['admin', 'user', 'moderator'])
                .fieldConfig<FieldConfig<FieldTypes, 'select'> & UserFieldConfig>({
                    fieldType: 'select',
                    label: 'User Role',
                    placeholder: 'Select a role',
                    options: [
                        { value: 'admin', label: 'Administrator' },
                        { value: 'user', label: 'Regular User' },
                        { value: 'moderator', label: 'Moderator' },
                    ],
                }),
            bio: z
                .string()
                .fieldConfig<FieldConfig<FieldTypes, 'textarea'> & UserFieldConfig>({
                    fieldType: 'textarea',
                    label: 'Biography',
                    placeholder: 'Tell us about yourself',
                    rows: 4,
                    maxLength: 500,
                })
                .optional(),
        });

    return (
        <div className="user-form">
            <h2>User Registration Form (Legacy Style)</h2>
            <FormInstantProvider cbP={createUserSchema} dp={dp}>
                <form>
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <FormInstantElement
                            name="name"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                        <FormInstantElement
                            name="email"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                        <FormInstantElement
                            name="age"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                    </div>

                    <div className="form-section">
                        <h3>Account Settings</h3>
                        <FormInstantElement
                            name="isActive"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                        <FormInstantElement
                            name="role"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                    </div>

                    <div className="form-section">
                        <h3>Additional Information</h3>
                        <FormInstantElement
                            name="bio"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                    </div>
                </form>
            </FormInstantProvider>
        </div>
    );
}

// Example 2: Using useSchema hook (legacy style)
export function UserFormExample2() {
    const dp = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 30,
        isActive: false,
        role: 'admin',
        bio: 'Product manager',
    };

    // Schema creation function
    const createUserSchema = (dp: Record<string, any>) =>
        z.object({
            name: z.string().fieldConfig<FieldConfig<FieldTypes, 'text'> & UserFieldConfig>({
                fieldType: 'text',
                label: 'Full Name',
                placeholder: 'Enter your full name',
                maxLength: 50,
                required: true,
                userSpecific: {
                    minAge: 18,
                    maxAge: 100,
                },
            }),
            email: z
                .string()
                .email()
                .fieldConfig<FieldConfig<FieldTypes, 'email'> & UserFieldConfig>({
                    fieldType: 'email',
                    label: 'Email Address',
                    placeholder: 'Enter your email',
                    validation: {
                        message: 'Please enter a valid email address',
                        async: true,
                    },
                    dp: { email: dp.email || 'default@example.com' },
                }),
            age: z
                .number()
                .fieldConfig<FieldConfig<FieldTypes, 'number'> & UserFieldConfig>({
                    fieldType: 'number',
                    label: 'Age',
                    placeholder: 'Enter your age',
                    min: 0,
                    max: 120,
                    step: 1,
                    userSpecific: {
                        minAge: 0,
                        maxAge: 120,
                    },
                })
                .optional(),
            isActive: z
                .boolean()
                .fieldConfig<FieldConfig<FieldTypes, 'boolean'> & UserFieldConfig>({
                    fieldType: 'boolean',
                    label: 'Active Status',
                    description: 'Check if user is active',
                }),
            role: z
                .enum(['admin', 'user', 'moderator'])
                .fieldConfig<FieldConfig<FieldTypes, 'select'> & UserFieldConfig>({
                    fieldType: 'select',
                    label: 'User Role',
                    placeholder: 'Select a role',
                    options: [
                        { value: 'admin', label: 'Administrator' },
                        { value: 'user', label: 'Regular User' },
                        { value: 'moderator', label: 'Moderator' },
                    ],
                }),
            bio: z
                .string()
                .fieldConfig<FieldConfig<FieldTypes, 'textarea'> & UserFieldConfig>({
                    fieldType: 'textarea',
                    label: 'Biography',
                    placeholder: 'Tell us about yourself',
                    rows: 4,
                    maxLength: 500,
                })
                .optional(),
        });

    // Use the legacy useSchema hook
    const { schema, initialValues } = useSchema(createUserSchema, dp);

    return (
        <div className="user-form">
            <h2>User Registration Form (useSchema Hook)</h2>
            <FormInstantProvider cbP={createUserSchema} dp={dp}>
                <form>
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <FormInstantElement
                            name="name"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                        <FormInstantElement
                            name="email"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                        <FormInstantElement
                            name="age"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                    </div>

                    <div className="form-section">
                        <h3>Account Settings</h3>
                        <FormInstantElement
                            name="isActive"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                        <FormInstantElement
                            name="role"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                    </div>

                    <div className="form-section">
                        <h3>Additional Information</h3>
                        <FormInstantElement
                            name="bio"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                    </div>
                </form>
            </FormInstantProvider>

            {/* Display schema and initial values */}
            <div className="form-data-display">
                <h4>Schema and Initial Values (from useSchema)</h4>
                <div className="data-section">
                    <h5>Schema Type:</h5>
                    <pre>{schema ? 'Schema loaded successfully' : 'No schema'}</pre>
                </div>
                <div className="data-section">
                    <h5>Initial Values:</h5>
                    <pre>{JSON.stringify(initialValues, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}

// Example 3: Using FormInstantField with path-based selection
export function UserFormExample3() {
    const dp = {
        name: 'Bob Smith',
        email: 'bob@example.com',
        age: 35,
        isActive: true,
        role: 'moderator',
        bio: 'Community manager',
    };

    const createUserSchema = (dp: Record<string, any>) =>
        z.object({
            name: z.string().fieldConfig<FieldConfig<FieldTypes, 'text'> & UserFieldConfig>({
                fieldType: 'text',
                label: 'Full Name',
                placeholder: 'Enter your full name',
                maxLength: 50,
                required: true,
                userSpecific: {
                    minAge: 18,
                    maxAge: 100,
                },
            }),
            email: z
                .string()
                .email()
                .fieldConfig<FieldConfig<FieldTypes, 'email'> & UserFieldConfig>({
                    fieldType: 'email',
                    label: 'Email Address',
                    placeholder: 'Enter your email',
                    validation: {
                        message: 'Please enter a valid email address',
                        async: true,
                    },
                    dp: { email: dp.email || 'default@example.com' },
                }),
            age: z
                .number()
                .fieldConfig<FieldConfig<FieldTypes, 'number'> & UserFieldConfig>({
                    fieldType: 'number',
                    label: 'Age',
                    placeholder: 'Enter your age',
                    min: 0,
                    max: 120,
                    step: 1,
                    userSpecific: {
                        minAge: 0,
                        maxAge: 120,
                    },
                })
                .optional(),
            isActive: z
                .boolean()
                .fieldConfig<FieldConfig<FieldTypes, 'boolean'> & UserFieldConfig>({
                    fieldType: 'boolean',
                    label: 'Active Status',
                    description: 'Check if user is active',
                }),
            role: z
                .enum(['admin', 'user', 'moderator'])
                .fieldConfig<FieldConfig<FieldTypes, 'select'> & UserFieldConfig>({
                    fieldType: 'select',
                    label: 'User Role',
                    placeholder: 'Select a role',
                    options: [
                        { value: 'admin', label: 'Administrator' },
                        { value: 'user', label: 'Regular User' },
                        { value: 'moderator', label: 'Moderator' },
                    ],
                }),
            bio: z
                .string()
                .fieldConfig<FieldConfig<FieldTypes, 'textarea'> & UserFieldConfig>({
                    fieldType: 'textarea',
                    label: 'Biography',
                    placeholder: 'Tell us about yourself',
                    rows: 4,
                    maxLength: 500,
                })
                .optional(),
        });

    return (
        <div className="user-form">
            <h2>User Registration Form (Path-based)</h2>
            <FormInstantProvider cbP={createUserSchema} dp={dp}>
                <form>
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <FormInstantField
                            path="name"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                        <FormInstantField
                            path="email"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                        <FormInstantField
                            path="age"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                    </div>

                    <div className="form-section">
                        <h3>Account Settings</h3>
                        <FormInstantField
                            path="isActive"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                        <FormInstantField
                            path="role"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                    </div>

                    <div className="form-section">
                        <h3>Additional Information</h3>
                        <FormInstantField
                            path="bio"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                    </div>
                </form>
            </FormInstantProvider>
        </div>
    );
}

// Example 4: Using hooks to access form data
export function UserFormWithHooks() {
    const dp = {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        age: 28,
        isActive: true,
        role: 'user',
        bio: 'Software engineer',
    };

    const createUserSchema = (dp: Record<string, any>) =>
        z.object({
            name: z.string().fieldConfig<FieldConfig<FieldTypes, 'text'> & UserFieldConfig>({
                fieldType: 'text',
                label: 'Full Name',
                placeholder: 'Enter your full name',
                maxLength: 50,
                required: true,
                userSpecific: {
                    minAge: 18,
                    maxAge: 100,
                },
            }),
            email: z
                .string()
                .email()
                .fieldConfig<FieldConfig<FieldTypes, 'email'> & UserFieldConfig>({
                    fieldType: 'email',
                    label: 'Email Address',
                    placeholder: 'Enter your email',
                    validation: {
                        message: 'Please enter a valid email address',
                        async: true,
                    },
                    dp: { email: dp.email || 'default@example.com' },
                }),
            age: z
                .number()
                .fieldConfig<FieldConfig<FieldTypes, 'number'> & UserFieldConfig>({
                    fieldType: 'number',
                    label: 'Age',
                    placeholder: 'Enter your age',
                    min: 0,
                    max: 120,
                    step: 1,
                    userSpecific: {
                        minAge: 0,
                        maxAge: 120,
                    },
                })
                .optional(),
            isActive: z
                .boolean()
                .fieldConfig<FieldConfig<FieldTypes, 'boolean'> & UserFieldConfig>({
                    fieldType: 'boolean',
                    label: 'Active Status',
                    description: 'Check if user is active',
                }),
            role: z
                .enum(['admin', 'user', 'moderator'])
                .fieldConfig<FieldConfig<FieldTypes, 'select'> & UserFieldConfig>({
                    fieldType: 'select',
                    label: 'User Role',
                    placeholder: 'Select a role',
                    options: [
                        { value: 'admin', label: 'Administrator' },
                        { value: 'user', label: 'Regular User' },
                        { value: 'moderator', label: 'Moderator' },
                    ],
                }),
            bio: z
                .string()
                .fieldConfig<FieldConfig<FieldTypes, 'textarea'> & UserFieldConfig>({
                    fieldType: 'textarea',
                    label: 'Biography',
                    placeholder: 'Tell us about yourself',
                    rows: 4,
                    maxLength: 500,
                })
                .optional(),
        });

    return (
        <div className="user-form">
            <h2>User Registration Form (With Hooks)</h2>
            <FormInstantProvider cbP={createUserSchema} dp={dp}>
                <FormDataDisplay />
                <form>
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <FormInstantElement
                            name="name"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                        <FormInstantElement
                            name="email"
                            componentMapping={componentMapping}
                            transformProps={transformProps}
                        />
                    </div>
                </form>
            </FormInstantProvider>
        </div>
    );
}

// Component to display form data using hooks
function FormDataDisplay() {
    const nameField = useFields('name');
    const emailField = useFields('email');

    return (
        <div className="form-data-display">
            <h4>Form Data (from hooks)</h4>
            <div className="data-section">
                <h5>Name Field:</h5>
                <pre>{JSON.stringify(nameField, null, 2)}</pre>
            </div>
            <div className="data-section">
                <h5>Email Field:</h5>
                <pre>{JSON.stringify(emailField, null, 2)}</pre>
            </div>
        </div>
    );
}

// Example 5: Form with validation and submission
export function UserFormWithValidation() {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            // Validate with Zod schema
            const validatedData = userSchema.parse(formData);
            console.log('Validated data:', validatedData);

            // Submit to API
            // await submitUser(validatedData);
        } catch (error: any) {
            if (error.errors) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err: any) => {
                    newErrors[err.path.join('.')] = err.message;
                });
                setErrors(newErrors);
            }
        }
    };

    const handleInputChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="user-form-with-validation">
            <h2>User Registration with Validation</h2>
            <FormInstantProvider schema={userSchema}>
                <form onSubmit={handleSubmit}>
                    <FormInstantForm
                        componentMapping={componentMapping}
                        transformProps={(field) => ({
                            ...transformProps(field),
                            value: formData[field.name] || '',
                            onChange: (e: any) => handleInputChange(field.name, e.target.value),
                            error: errors[field.name],
                        })}
                    />

                    <div className="form-actions">
                        <button type="submit" className="submit-button">
                            Register User
                        </button>
                    </div>
                </form>
            </FormInstantProvider>
        </div>
    );
}

// CSS styles for the examples
export const styles = `
.user-form {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

.form-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
}

.form-section h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
}

.form-field {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #333;
}

.required {
    color: #dc3545;
    margin-left: 4px;
}

.form-input,
.form-select,
.form-textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.checkbox {
    display: flex;
    align-items: flex-start;
}

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.form-checkbox {
    margin-right: 8px;
}

.checkbox-text {
    font-weight: 500;
}

.field-description {
    margin-top: 5px;
    font-size: 12px;
    color: #666;
}

.validation-message {
    margin-top: 5px;
    font-size: 12px;
    color: #dc3545;
}

.async-validation {
    margin-top: 5px;
    font-size: 12px;
    color: #007bff;
}

.field-info {
    margin-top: 5px;
    font-size: 12px;
    color: #28a745;
    background: #f8f9fa;
    padding: 5px;
    border-radius: 3px;
}

.form-actions {
    margin-top: 30px;
    text-align: center;
}

.submit-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.submit-button:hover {
    background: #0056b3;
}

.form-data-display {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.data-section {
    margin-bottom: 20px;
}

.data-section h5 {
    margin-bottom: 10px;
    color: #333;
}

.data-section pre {
    background: #fff;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-size: 12px;
    overflow-x: auto;
}
`;
