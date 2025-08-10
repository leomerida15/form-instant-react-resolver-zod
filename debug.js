import { z } from 'zod';

const schema = z.object({
    name: z.string(),
    email: z.string().email(),
});

console.log('Schema:', schema);
console.log('Schema._def:', schema._def);
console.log('Schema._def.typeName:', schema._def?.typeName);
console.log('Schema.shape:', schema.shape);

// Try to access the shape
const shape = schema.shape;
console.log('Shape keys:', Object.keys(shape));
console.log('Shape name field:', shape.name);
console.log('Shape name field type:', shape.name._def?.typeName);
