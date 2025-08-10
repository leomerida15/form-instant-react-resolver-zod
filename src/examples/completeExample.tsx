import { z } from '../utils/zodExtensions';
import { FieldConfig } from '../types';
import { SchemaMapper, FormInstantElement, SchemaField } from '../components/SchemaMapper';
import { parseSchema } from '../utils/schemaParser';
import { ComponentType, useState, FormEvent } from 'react';

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
const TextInput: FC<any> = ({ label, placeholder, maxLength, required, name, path, ...props }) => (
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

const EmailInput: FC<any> = ({ label, placeholder, validation, name, ...props }) => (
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

const NumberInput: FC<any> = ({ label, placeholder, min, max, step, name, ...props }) => (
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

const CheckboxInput: FC<any> = ({ label, description, name, ...props }) => (
    <div className="form-field checkbox">
        <label className="checkbox-label">
            <input type="checkbox" name={name} className="form-checkbox" {...props} />
            <span className="checkbox-text">{label}</span>
        </label>
        {description && <div className="field-description">{description}</div>}
    </div>
);

const SelectInput: FC<any> = ({ label, placeholder, options, name, ...props }) => (
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

const TextareaInput: FC<any> = ({ label, placeholder, rows, maxLength, name, ...props }) => (
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

// Create the user schema with fieldConfig
const userSchema = z.object({
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
            dp: { email: 'default@example.com' },
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
    isActive: z.boolean().fieldConfig<FieldConfig<FieldTypes, 'boolean'> & UserFieldConfig>({
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

// Component mapping based on fieldType
const componentMapping: Record<string, ComponentType<any>> = {
    // Map by fieldType
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

// Example 1: Using SchemaMapper with automatic rendering
export function UserFormExample1() {
    return (
        <div className="user-form">
            <h2>User Registration Form</h2>
            <SchemaMapper
                schema={userSchema}
                componentMapping={componentMapping}
                transformProps={transformProps}
            />
        </div>
    );
}

// Example 2: Using SchemaMapper with children (manual rendering)
export function UserFormExample2() {
    return (
        <div className="user-form">
            <h2>User Registration Form (Manual)</h2>
            <SchemaMapper
                schema={userSchema}
                componentMapping={componentMapping}
                transformProps={transformProps}
            >
                <div className="form-section">
                    <h3>Personal Information</h3>
                    <FormInstantElement name="name" />
                    <FormInstantElement name="email" />
                    <FormInstantElement name="age" />
                </div>

                <div className="form-section">
                    <h3>Account Settings</h3>
                    <FormInstantElement name="isActive" />
                    <FormInstantElement name="role" />
                </div>

                <div className="form-section">
                    <h3>Additional Information</h3>
                    <FormInstantElement name="bio" />
                </div>
            </SchemaMapper>
        </div>
    );
}

// Example 3: Using SchemaField with specific paths
export function UserFormExample3() {
    return (
        <div className="user-form">
            <h2>User Registration Form (Path-based)</h2>
            <SchemaMapper
                schema={userSchema}
                componentMapping={componentMapping}
                transformProps={transformProps}
            >
                <div className="form-section">
                    <h3>Personal Information</h3>
                    <SchemaField path="name" />
                    <SchemaField path="email" />
                    <SchemaField path="age" />
                </div>

                <div className="form-section">
                    <h3>Account Settings</h3>
                    <SchemaField path="isActive" />
                    <SchemaField path="role" />
                </div>

                <div className="form-section">
                    <h3>Additional Information</h3>
                    <SchemaField path="bio" />
                </div>
            </SchemaMapper>
        </div>
    );
}

// Example 4: Custom component with fieldConfig access
export function CustomUserForm() {
    const metadata = parseSchema(userSchema);

    return (
        <div className="custom-user-form">
            <h2>Custom User Form</h2>
            <form>
                {Object.values(metadata.fields).map((field) => {
                    // Access fieldConfig information
                    const fieldConfig = field.fieldConfig;

                    if (!fieldConfig) {
                        return null; // Skip fields without fieldConfig
                    }

                    // Determine component based on fieldType
                    const Component = componentMapping[fieldConfig.fieldType];

                    if (!Component) {
                        console.warn(`No component found for fieldType: ${fieldConfig.fieldType}`);
                        return null;
                    }

                    const props = {
                        name: field.name,
                        path: field.path,
                        required: field.required,
                        defaultValue: field.defaultValue,
                        ...fieldConfig,
                    };

                    return (
                        <div key={field.path} className="field-wrapper">
                            <Component {...props} />
                            {/* Show fieldConfig debug info */}
                            <div className="field-debug">
                                <small>
                                    Type: {fieldConfig.fieldType} | Path: {field.path} | Required:{' '}
                                    {field.required ? 'Yes' : 'No'}
                                </small>
                            </div>
                        </div>
                    );
                })}
            </form>
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
            <form onSubmit={handleSubmit}>
                <SchemaMapper
                    schema={userSchema}
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

.field-debug {
    margin-top: 5px;
    padding: 5px;
    background: #f8f9fa;
    border-radius: 3px;
    font-family: monospace;
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
`;
