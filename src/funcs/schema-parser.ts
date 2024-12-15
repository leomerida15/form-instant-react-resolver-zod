import { ParsedField } from '@form-instant/react-input-mapping';
import { z } from 'zod';
import { getDefaultValueInZodStack } from './default-values';
import { getFieldConfigInZodStack } from './field-config';
import { inferFieldType } from './field-type-inference';
import { ParsedSchema, ZodObjectOrWrapped } from './types';

interface typeMappingProps {
    schema: z.ZodTypeAny;
    name: string;
    history?: string;
    dependecys: Record<string, any>;
}

type typeMappingType = Record<
    'ZodDiscriminatedUnion' | 'ZodObject' | 'ZodArray',
    (p: typeMappingProps) => ParsedField<any, string>[]
>;

const typeMapping: typeMappingType = {
    ZodDiscriminatedUnion({ schema, name, history, dependecys }) {
        const { optionsMap, discriminator, fieldConfig } = schema._def;

        if (!Object.keys(dependecys).length) return [{}] as ParsedField<any, string>[];

        const optionKey = dependecys[discriminator];
        const option = optionsMap.get(optionKey);

        if (!option) return [{}] as ParsedField<any, string>[];

        const entries = Object.entries(option.shape);

        const fields = entries
            .filter(([key]) => key !== discriminator)
            .map(([key, field]) => {
                let historyFormat = (history ? [history, name] : [name]).join('.');

                if (historyFormat.charAt(0) === '.') historyFormat = historyFormat.substring(1);
                return parseField({
                    name: key,
                    schema: field as z.ZodTypeAny,
                    history: historyFormat,
                    dependecys,
                });
            });

        let historyFormat = (history ? [history, name, discriminator] : [name, discriminator]).join(
            '.',
        );

        if (historyFormat.charAt(0) === '.') historyFormat = historyFormat.substring(1);

        fields.unshift({
            name: {
                current: discriminator,
                history: historyFormat,
            },
            type: 'discriminator',
            required: true,
            default: optionKey,
            fieldConfig,
            options: Array.from(optionsMap.keys()).map((key) => [String(key), String(key)]),
        });

        return fields;
    },

    ZodObject({ schema, name, history, dependecys }) {
        let historyFormat = (history ? [history, name] : [name]).join('.');

        if (historyFormat.charAt(0) === '.') historyFormat = historyFormat.substring(1);
        return Object.entries((schema as any).shape).map(([key, field]) =>
            parseField({
                name: key,
                schema: field as z.ZodTypeAny,
                history: historyFormat,
                dependecys,
            }),
        );
    },

    ZodArray({ schema, name, history, dependecys }) {
        let historyFormat = (history ? [history, name] : [name]).join('.');

        if (historyFormat.charAt(0) === '.') historyFormat = historyFormat.substring(1);
        return [
            parseField({
                name: '0',
                schema: schema._def.type,
                history: historyFormat,
                dependecys,
            }),
        ];
    },
};

function parseField({
    name,
    schema,
    history,
    dependecys = {},
}: typeMappingProps): ParsedField<any> {
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

    const { typeName } = baseSchema._def;

    // Arrays and objects
    const getSubSchema = typeMapping[typeName as keyof typeof typeMapping];

    const subSchema = getSubSchema?.({
        name,
        schema: baseSchema,
        history,
        dependecys,
    });

    if (typeName === 'ZodDiscriminatedUnion') {
        const { optionsMap, discriminator } = baseSchema._def;

        const optionKey = dependecys[discriminator];

        if (optionKey) {
            const option = optionsMap.get(optionKey);

            if (option._def.fieldConfig) {
                fieldConfig = {
                    ...fieldConfigBase,
                    ...option._def.fieldConfig,
                };
            }
        }
    }

    if (type === 'array')
        fieldConfig = {
            min: baseSchema._def.minLength?.value || 1,
            max: baseSchema._def.maxLength?.value,
            ...fieldConfig,
        };

    let historyFormat = (history ? [history, name] : [name]).join('.');

    if (historyFormat.charAt(0) === '.') historyFormat = historyFormat.substring(1);

    const resp = {
        name: {
            current: name,
            history: historyFormat,
        },
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

    const dependecys = (objectSchema._def as any).fieldConfig?.dp || {};

    console.log('dependecys', dependecys);

    const fields = Object.fromEntries(
        Object.entries(shape).map(([key, field]) => [
            key,
            parseField({
                name: key,
                schema: field as z.ZodTypeAny,
                dependecys,
            }),
        ]),
    );

    return { fields };
};
