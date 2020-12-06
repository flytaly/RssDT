/* eslint-disable no-param-reassign */
import normalizeUrl from 'normalize-url';
import Joi, { AnySchema } from 'joi';
import { createMethodDecorator } from 'type-graphql';
import { ArgumentError } from '../resolvers/common/ArgumentError';

const NORM_METADATA_KEY = Symbol('normalize_meta');
const VAL_METADATA_KEY = Symbol('validate_meta');

type InputType = 'email' | 'password' | 'feedUrl';

const validates: Record<InputType, AnySchema> = {
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required(),
    feedUrl: Joi.string().uri({
        allowRelative: false,
        scheme: ['http', 'https'],
        domain: {},
    }),
};

const normalizes: Record<InputType, Function> = {
    email: (arg: string) => arg?.trim().toLowerCase(),
    password: (arg: string) => arg?.trim(),
    feedUrl: (arg: string) =>
        normalizeUrl(arg, {
            defaultProtocol: 'https://',
        }),
};

export function NormalizedInput(inputType: InputType): PropertyDecorator {
    return (target, propertyKey) => {
        const classConstructor = target.constructor;
        const normalizeMeta = {
            ...(Reflect.getMetadata(NORM_METADATA_KEY, classConstructor) || {}),
        };
        normalizeMeta[propertyKey] = normalizes[inputType];
        Reflect.defineMetadata(NORM_METADATA_KEY, normalizeMeta, classConstructor);
    };
}

export function ValidatedInput(inputType: InputType): PropertyDecorator {
    return (target, propertyKey) => {
        const classConstructor = target.constructor;
        const validateSchema = {
            ...(Reflect.getMetadata(VAL_METADATA_KEY, classConstructor) || {}),
        };
        validateSchema[propertyKey] = validates[inputType];
        Reflect.defineMetadata(VAL_METADATA_KEY, validateSchema, classConstructor);
    };
}

export function InputMetadata(inputType: InputType): PropertyDecorator {
    return (target, propertyKey) => {
        NormalizedInput(inputType)(target, propertyKey);
        ValidatedInput(inputType)(target, propertyKey);
    };
}

export function NormalizeAndValidateArgs(InputSchema: Object, path: string): MethodDecorator {
    return createMethodDecorator(async ({ args }, next) => {
        const argsObj = path ? args[path] : args;

        // Normalization
        const normalizeArgs = Reflect.getOwnMetadata(NORM_METADATA_KEY, InputSchema);
        try {
            Object.keys(normalizeArgs).forEach((key) => {
                argsObj[key] = normalizeArgs[key](argsObj[key]);
            });
        } catch (error) {
            return {
                errors: [
                    new ArgumentError(
                        error.message.startsWith('Invalid URL') ? 'feedUrl' : '',
                        error.message,
                    ),
                ],
            };
        }

        // Validation
        const validateSchema = Reflect.getOwnMetadata(VAL_METADATA_KEY, InputSchema);
        const { error } = Joi.object(validateSchema).validate(argsObj);
        if (error) {
            const argumentErrors: ArgumentError[] = error.details.map((e) => ({
                argument: e.context?.key,
                message: e.message,
            }));
            return { errors: argumentErrors };
        }

        return next();
    });
}
