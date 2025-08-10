import { describe, it, expect } from 'bun:test';
import { z } from 'zod';
import { parseSchema, getFieldType, isFieldRequired, getDefaultValue } from '../src/utils/schemaParser';
import { resolvePath, getAllPaths, hasPath, getSchemaAtPath } from '../src/utils/pathResolver';

describe('Schema Parser Utils', () => {
    const testSchema = z.object({
        user: z.object({
            profile: z.object({
                email: z.string().email(),
                name: z.string(),
                age: z.number().optional(),
            }),
        }),
    });

    it('should parse schema metadata correctly', () => {
        const metadata = parseSchema(testSchema);
        
        expect(metadata).toBeDefined();
        expect(metadata.fields).toBeDefined();
        expect(metadata.paths).toBeDefined();
        expect(metadata.structure).toBeDefined();
        
        // Check that we have the expected fields
        expect(metadata.fields.user).toBeDefined();
        expect(metadata.fields['user.profile']).toBeDefined();
        expect(metadata.fields['user.profile.email']).toBeDefined();
        expect(metadata.fields['user.profile.name']).toBeDefined();
    });

    it('should get field type correctly', () => {
        const stringField = z.string();
        const numberField = z.number();
        const objectField = z.object({ name: z.string() });
        
        expect(getFieldType(stringField)).toBe('ZodString');
        expect(getFieldType(numberField)).toBe('ZodNumber');
        expect(getFieldType(objectField)).toBe('ZodObject');
    });

    it('should check if field is required correctly', () => {
        const requiredField = z.string();
        const optionalField = z.string().optional();
        const defaultField = z.string().default('test');
        
        expect(isFieldRequired(requiredField)).toBe(true);
        expect(isFieldRequired(optionalField)).toBe(false);
        expect(isFieldRequired(defaultField)).toBe(false);
    });

    it('should get default value correctly', () => {
        const noDefaultField = z.string();
        const defaultField = z.string().default('test');
        const optionalField = z.string().optional();
        
        expect(getDefaultValue(noDefaultField)).toBeUndefined();
        expect(getDefaultValue(defaultField)).toBe('test');
        expect(getDefaultValue(optionalField)).toBeUndefined();
    });
});

describe('Path Resolver Utils', () => {
    const testSchema = z.object({
        user: z.object({
            profile: z.object({
                email: z.string().email(),
                name: z.string(),
                age: z.number().optional(),
            }),
        }),
    });

    it('should resolve paths correctly', () => {
        const emailField = resolvePath(testSchema, 'user.profile.email');
        const nameField = resolvePath(testSchema, 'user.profile.name');
        const invalidField = resolvePath(testSchema, 'invalid.path');
        
        expect(emailField).toBeDefined();
        expect(emailField?.name).toBe('email');
        expect(emailField?.type).toBe('ZodString');
        expect(emailField?.required).toBe(true);
        
        expect(nameField).toBeDefined();
        expect(nameField?.name).toBe('name');
        expect(nameField?.type).toBe('ZodString');
        expect(nameField?.required).toBe(true);
        
        expect(invalidField).toBeNull();
    });

    it('should get all paths correctly', () => {
        const paths = getAllPaths(testSchema);
        
        expect(paths).toContain('user');
        expect(paths).toContain('user.profile');
        expect(paths).toContain('user.profile.email');
        expect(paths).toContain('user.profile.name');
        expect(paths).toContain('user.profile.age');
    });

    it('should check if path exists correctly', () => {
        expect(hasPath(testSchema, 'user.profile.email')).toBe(true);
        expect(hasPath(testSchema, 'user.profile.name')).toBe(true);
        expect(hasPath(testSchema, 'invalid.path')).toBe(false);
    });

    it('should get schema at path correctly', () => {
        const emailSchema = getSchemaAtPath(testSchema, 'user.profile.email');
        const nameSchema = getSchemaAtPath(testSchema, 'user.profile.name');
        const invalidSchema = getSchemaAtPath(testSchema, 'invalid.path');
        
        expect(emailSchema).toBeDefined();
        expect((emailSchema as any)?._def?.typeName).toBe('ZodString');
        
        expect(nameSchema).toBeDefined();
        expect((nameSchema as any)?._def?.typeName).toBe('ZodString');
        
        expect(invalidSchema).toBeNull();
    });
});

describe('Zod v4 Compatibility', () => {
    it('should work with Zod v4 schemas', () => {
        const schema = z.object({
            name: z.string(),
            email: z.string().email(),
            age: z.number().optional(),
        });

        const metadata = parseSchema(schema);
        expect(metadata.fields).toBeDefined();
        expect(Object.keys(metadata.fields).length).toBeGreaterThan(0);
    });

    it('should handle ZodEffects correctly', () => {
        const schema = z.object({
            name: z.string(),
        }).refine((data) => data.name.length > 0, {
            message: "Name must not be empty",
        });

        const metadata = parseSchema(schema);
        expect(metadata.fields).toBeDefined();
        expect(metadata.fields.name).toBeDefined();
    });

    it('should handle arrays correctly', () => {
        const schema = z.object({
            users: z.array(z.object({
                name: z.string(),
                email: z.string().email(),
            })),
        });

        const metadata = parseSchema(schema);
        expect(metadata.fields).toBeDefined();
        expect(metadata.fields.users).toBeDefined();
    });

    it('should handle discriminated unions correctly', () => {
        const schema = z.discriminatedUnion('type', [
            z.object({
                type: z.literal('user'),
                name: z.string(),
            }),
            z.object({
                type: z.literal('admin'),
                name: z.string(),
                permissions: z.array(z.string()),
            }),
        ]);

        const metadata = parseSchema(schema);
        expect(metadata.fields).toBeDefined();
        // Should have at least the discriminator field
        expect(metadata.fields.type).toBeDefined();
    });
});
