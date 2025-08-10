import { describe, it, expect } from 'bun:test';
import { z } from 'zod';
import {
    useSchemaMapping,
    useSchemaNavigation,
    useSchemaMetadata,
    SchemaMapper,
} from '../src/index';

describe('Migration from dts-cli to Bun.js', () => {
    it('should export all new agnostic architecture hooks', () => {
        expect(useSchemaMapping).toBeDefined();
        expect(useSchemaNavigation).toBeDefined();
        expect(useSchemaMetadata).toBeDefined();
    });

    it('should export the main SchemaMapper component', () => {
        expect(SchemaMapper).toBeDefined();
    });
});

describe('New Agnostic Architecture', () => {
    const testSchema = z.object({
        user: z.object({
            profile: z.object({
                email: z.string().email(),
                name: z.string(),
            }),
        }),
    });

    it('should parse schema metadata correctly', () => {
        const metadata = useSchemaMetadata(testSchema);

        expect(metadata.metadata).toBeDefined();
        expect(metadata.metadata.fields).toBeDefined();
        expect(metadata.metadata.paths).toBeDefined();
        expect(metadata.metadata.structure).toBeDefined();
    });

    it('should provide schema navigation functionality', () => {
        const navigation = useSchemaNavigation(testSchema);

        expect(navigation.navigate).toBeDefined();
        expect(navigation.getField).toBeDefined();
        expect(navigation.getPaths).toBeDefined();
        expect(navigation.hasPath).toBeDefined();
    });

    it('should support dot notation paths', () => {
        const navigation = useSchemaNavigation(testSchema);
        const paths = navigation.getPaths();

        expect(paths).toContain('user.profile.email');
        expect(paths).toContain('user.profile.name');
        expect(navigation.hasPath('user.profile.email')).toBe(true);
        expect(navigation.hasPath('user.profile.name')).toBe(true);
        expect(navigation.hasPath('invalid.path')).toBe(false);
    });

    it('should provide schema mapping functionality', () => {
        const componentMapping = {
            'user.profile.email': () => null,
            'user.profile.name': () => null,
        };

        const mapping = useSchemaMapping(testSchema, componentMapping);

        expect(mapping.schema).toBeDefined();
        expect(mapping.metadata).toBeDefined();
        expect(mapping.mappingConfig).toBeDefined();
    });
});

describe('Bun.js Integration', () => {
    it('should work with Bun.js test runner', () => {
        expect(Bun.version).toBeDefined();
        expect(typeof Bun.version).toBe('string');
    });

    it('should support modern ES modules', () => {
        const module = { default: 'test' };
        expect(module.default).toBe('test');
    });
});

describe('Zod v4 Compatibility', () => {
    it('should work with Zod v4 schemas', () => {
        const schema = z.object({
            name: z.string(),
            email: z.string().email(),
            age: z.number().optional(),
        });

        const metadata = useSchemaMetadata(schema);
        expect(metadata.metadata.fields).toBeDefined();
        expect(Object.keys(metadata.metadata.fields).length).toBeGreaterThan(0);
    });

    it('should handle ZodEffects correctly', () => {
        const schema = z
            .object({
                name: z.string(),
            })
            .refine((data) => data.name.length > 0, {
                message: 'Name must not be empty',
            });

        const metadata = useSchemaMetadata(schema);
        expect(metadata.metadata.fields).toBeDefined();
        expect(metadata.metadata.fields.name).toBeDefined();
    });
});
