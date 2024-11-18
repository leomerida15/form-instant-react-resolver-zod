import { ParsedField } from '@form-instant/react-input-mapping';
import { z } from 'zod';
import { getDefaultValueInZodStack } from './default-values';
import { getFieldConfigInZodStack } from './field-config';
import { inferFieldType } from './field-type-inference';
import { ParsedSchema, ZodObjectOrWrapped } from './types';

function parseField(name: string, schema: z.ZodTypeAny, history: string = ''): ParsedField<any> {
    const baseSchema = getBaseSchema(schema);
    const { fieldType, ...fieldConfig } = getFieldConfigInZodStack(schema);
    const type = inferFieldType(baseSchema, fieldType);
    const defaultValue = getDefaultValueInZodStack(schema);

    // Enums
    const options = baseSchema._def.values;
    let optionValues: [string, string][] = [];
    if (options) {
        if (!Array.isArray(options)) {
            optionValues = Object.entries(options);
        } else {
            optionValues = options.map((value) => [value, value]);
        }
    }

    // Arrays and objects
    let subSchema: ParsedField<any>[] = [];
    if (baseSchema._def.typeName === 'ZodObject') {
        subSchema = Object.entries((baseSchema as any).shape).map(([key, field]) =>
            parseField(key, field as z.ZodTypeAny, [history, name].join('.')),
        );
    }
    if (baseSchema._def.typeName === 'ZodArray') {
        subSchema = [parseField('0', baseSchema._def.type)];
    }

    const resp = {
        name: { current: name, history: [history, name].join('.') },
        type,
        required: !schema.isOptional(),
        default: defaultValue,
        fieldConfig,
        options: optionValues,
        schema: subSchema,
        description: baseSchema.description,
    };

    return resp;
}

function getBaseSchema<ChildType extends z.ZodAny | z.ZodTypeAny | z.AnyZodObject = z.ZodAny>(
    schema: ChildType | z.ZodEffects<ChildType>,
): ChildType {
    if ('innerType' in schema._def) {
        return getBaseSchema(schema._def.innerType as ChildType);
    }
    if ('schema' in schema._def) {
        return getBaseSchema(schema._def.schema as ChildType);
    }

    return schema as ChildType;
}

export const parseSchema = (S: ZodObjectOrWrapped): ParsedSchema => {
    const objectSchema = S instanceof z.ZodEffects ? S.innerType() : S;
    const shape = objectSchema.shape;

    const fields = Object.fromEntries(
        Object.entries(shape).map(([key, field]) => [key, parseField(key, field as z.ZodTypeAny)]),
    );

    return { fields };
};
