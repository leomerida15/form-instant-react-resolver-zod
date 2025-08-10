import { describe, it, expect } from 'bun:test';
import { z } from 'zod';
import { parseSchema } from '../src/utils/schemaParser';

describe('Debug Schema Parser', () => {
    it('should debug simple schema', () => {
        const schema = z.object({
            name: z.string(),
        });

        console.log('Schema:', schema);
        console.log('Schema._def:', (schema as any)._def);
        console.log('Schema._def.typeName:', (schema as any)._def?.typeName);
        console.log('Schema.shape:', (schema as any).shape);

        const metadata = parseSchema(schema);
        console.log('Metadata:', metadata);
        console.log('Fields:', metadata.fields);
        console.log('Paths:', metadata.paths);

        expect(metadata.fields).toBeDefined();
    });
});
