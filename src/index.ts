// Core hooks for schema mapping
export * from './hooks/useSchemaMapping';
export * from './hooks/useSchemaNavigation';
export * from './hooks/useSchemaMetadata';

// Main component for schema mapping
export * from './components/SchemaMapper';

// FormInstant components (legacy compatibility)
export { FormInstantProvider } from './components/FormInstantProvider';
export { FormInstantElement } from './components/FormInstantElement';

// Types and utilities
export * from './types';
export * from './utils/schemaParser';
export * from './utils/pathResolver';

// Zod extensions for backward compatibility
export * from './utils/zodExtensions';
