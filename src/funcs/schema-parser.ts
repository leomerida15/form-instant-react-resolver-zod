import { ParsedField } from '@form-instant/react-input-mapping';
import { z } from 'zod';
import { getDefaultValueInZodStack } from './default-values';
import { getFieldConfigInZodStack } from './field-config';
import { inferFieldType } from './field-type-inference';
import { ParsedSchema, ZodObjectOrWrapped } from './types';

const typeMapping = {
    ZodDiscriminatedUnion(
        baseSchema: z.ZodTypeAny,
        name: string,
        history: string,
        dependecys: Record<string, any>,
    ) {
        const { optionsMap, discriminator, fieldConfig } = baseSchema._def;

        if (!Object.keys(dependecys).length) return [{}] as ParsedField<any, string>[];

        const optionKey = dependecys[discriminator];
        const option = optionsMap.get(optionKey);

        if (!option) return [{}] as ParsedField<any, string>[];

        const entries = Object.entries(option.shape);

        const fields = entries
            .filter(([key]) => key !== discriminator)
            .map(([key, field]) => {
                return parseField(
                    key,
                    field as z.ZodTypeAny,
                    [history, name].join('.'),
                    dependecys,
                );
            });

        fields.unshift({
            name: {
                current: discriminator,
                history: [history, name, discriminator].join('.'),
            },
            type: 'discriminator',
            required: true,
            default: optionKey,
            fieldConfig,
            options: Array.from(optionsMap.keys()).map((key) => [String(key), String(key)]),
        });

        return fields;
    },

    ZodObject(
        baseSchema: z.ZodTypeAny,
        name: string,
        history: string,
        dependecys: Record<string, any>,
    ) {
        return Object.entries((baseSchema as any).shape).map(([key, field]) =>
            parseField(key, field as z.ZodTypeAny, [history, name].join('.'), dependecys),
        );
    },

    ZodArray(
        baseSchema: z.ZodTypeAny,
        name: string,
        history: string,
        dependecys: Record<string, any>,
    ) {
        return [parseField('0', baseSchema._def.type, [history, name].join('.'), dependecys)];
    },
};

function parseField(
    name: string,
    schema: z.ZodTypeAny,
    history: string = '',
    dependecys: Record<string, any> = {},
): ParsedField<any> {
    const baseSchema = getBaseSchema(schema);
    const { fieldType, ...fieldConfigBase } = getFieldConfigInZodStack(schema);
    const type = inferFieldType(baseSchema, fieldType);
    const defaultValue = getDefaultValueInZodStack(schema);

    let fieldConfig = fieldConfigBase;

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
    const getSubSchema = typeMapping[baseSchema._def.typeName as keyof typeof typeMapping];

    const subSchema = getSubSchema?.(baseSchema, name, history, dependecys);

    if (baseSchema._def.typeName === 'ZodArray') {
        fieldConfig = {
            min: baseSchema._def.minLength?.value || 1,
            max: baseSchema._def.maxLength?.value,
            ...fieldConfig,
        };
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

    const dependecys = (objectSchema._def as any).fieldConfig;

    const fields = Object.fromEntries(
        Object.entries(shape).map(([key, field]) => [
            key,
            parseField(key, field as z.ZodTypeAny, '', dependecys),
        ]),
    );

    return { fields };
};
