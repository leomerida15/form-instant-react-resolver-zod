# Sistema Completo de Formularios con Zod y React

Este documento explica cómo funciona el sistema completo de formularios que combina Zod schemas, fieldConfig, y mapping de componentes React.

## 🎯 **Visión General**

El sistema permite crear formularios completamente tipados usando:

- **Zod schemas** para validación y estructura
- **fieldConfig** para configuración de campos con `fieldType` obligatorio
- **Component mapping** para renderizar automáticamente componentes React
- **Extraction automática** de configuración en el parser

## 🏗️ **Arquitectura del Sistema**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Zod Schema    │───▶│  Schema Parser   │───▶│  React Form     │
│  + fieldConfig  │    │  + extraction    │    │  + Components   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 **1. Definición de Tipos de Campos**

Primero, definimos los tipos de campos que soportará nuestro sistema:

```typescript
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
```

## 🔧 **2. Creación del Schema con fieldConfig**

Usamos el tipo `FieldConfig<FieldTypes, 'fieldType'>` para asegurar que `fieldType` sea obligatorio:

```typescript
import { z } from '../utils/zodExtensions';
import { FieldConfig } from '../types';

const userSchema = z.object({
    name: z.string().fieldConfig<FieldConfig<FieldTypes, 'text'>>({
        fieldType: 'text', // Obligatorio
        label: 'Full Name',
        placeholder: 'Enter your full name',
        maxLength: 50,
        required: true,
    }),
    email: z
        .string()
        .email()
        .fieldConfig<FieldConfig<FieldTypes, 'email'>>({
            fieldType: 'email', // Obligatorio
            label: 'Email Address',
            placeholder: 'Enter your email',
            validation: {
                message: 'Please enter a valid email address',
                async: true,
            },
        }),
    age: z
        .number()
        .fieldConfig<FieldConfig<FieldTypes, 'number'>>({
            fieldType: 'number', // Obligatorio
            label: 'Age',
            placeholder: 'Enter your age',
            min: 0,
            max: 120,
            step: 1,
        })
        .optional(),
    // ... más campos
});
```

## 🎨 **3. Componentes React**

Creamos componentes React que reciben las props del fieldConfig:

```typescript
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
    </div>
);

const EmailInput: React.FC<any> = ({
    label,
    placeholder,
    validation,
    name,
    ...props
}) => (
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
        {validation?.message && (
            <div className="validation-message">{validation.message}</div>
        )}
        {validation?.async && (
            <div className="async-validation">Validating...</div>
        )}
    </div>
);
```

## 🗺️ **4. Component Mapping**

Mapeamos los `fieldType` a los componentes correspondientes:

```typescript
const componentMapping: Record<string, React.ComponentType<any>> = {
    text: TextInput,
    email: EmailInput,
    number: NumberInput,
    boolean: CheckboxInput,
    select: SelectInput,
    textarea: TextareaInput,
};
```

## 🔄 **5. Transform Props**

Función para transformar los metadatos del campo en props para los componentes:

```typescript
const transformProps = (field: any) => {
    const baseProps = {
        name: field.name,
        path: field.path,
        required: field.required,
        defaultValue: field.defaultValue,
    };

    // Si el campo tiene fieldConfig, lo fusionamos con las props base
    if (field.fieldConfig) {
        return {
            ...baseProps,
            ...field.fieldConfig,
            fieldConfig: field.fieldConfig, // Mantener referencia original
        };
    }

    return baseProps;
};
```

## 🚀 **6. Uso del Sistema**

### **Ejemplo 1: Renderizado Automático**

```typescript
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
```

### **Ejemplo 2: Renderizado Manual con Children**

```typescript
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
            </SchemaMapper>
        </div>
    );
}
```

### **Ejemplo 3: Renderizado por Path**

```typescript
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
            </SchemaMapper>
        </div>
    );
}
```

## 🔍 **7. Acceso Directo a fieldConfig**

Puedes acceder directamente a la configuración extraída:

```typescript
export function CustomUserForm() {
    const metadata = parseSchema(userSchema);

    return (
        <div className="custom-user-form">
            <h2>Custom User Form</h2>
            <form>
                {Object.values(metadata.fields).map((field) => {
                    // Acceder a la información de fieldConfig
                    const fieldConfig = field.fieldConfig;

                    if (!fieldConfig) {
                        return null; // Saltar campos sin fieldConfig
                    }

                    // Determinar componente basado en fieldType
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
                            {/* Mostrar información de debug */}
                            <div className="field-debug">
                                <small>
                                    Type: {fieldConfig.fieldType} |
                                    Path: {field.path} |
                                    Required: {field.required ? 'Yes' : 'No'}
                                </small>
                            </div>
                        </div>
                    );
                })}
            </form>
        </div>
    );
}
```

## ✅ **8. Validación y Envío**

```typescript
export function UserFormWithValidation() {
    const [formData, setFormData] = React.useState({});
    const [errors, setErrors] = React.useState({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Validar con Zod schema
            const validatedData = userSchema.parse(formData);
            console.log('Validated data:', validatedData);

            // Enviar a API
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
```

## 🎯 **Beneficios del Sistema**

1. **Tipado Fuerte**: TypeScript valida que `fieldType` sea una key válida
2. **Extraction Automática**: `parseSchema` extrae automáticamente la configuración
3. **Component Mapping**: Mapeo automático de `fieldType` a componentes
4. **Flexibilidad**: Múltiples formas de renderizar formularios
5. **Validación**: Integración completa con Zod para validación
6. **IDE Support**: Autocompletado completo en editores
7. **Reutilización**: Componentes y configuraciones reutilizables

## 🔧 **Flujo de Datos**

1. **Schema Definition** → Zod schema con fieldConfig
2. **Parsing** → `parseSchema()` extrae metadatos y fieldConfig
3. **Component Mapping** → `fieldType` determina qué componente usar
4. **Props Transformation** → fieldConfig se convierte en props
5. **Rendering** → Componente React se renderiza con props
6. **Validation** → Zod valida los datos del formulario

Este sistema proporciona una solución completa y tipada para crear formularios dinámicos basados en schemas Zod.
