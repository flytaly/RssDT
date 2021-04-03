import normalizeUrl from 'normalize-url';
import Joi, { AnySchema } from 'joi';
import { createMethodDecorator } from 'type-graphql';
import { DateTime } from 'luxon';
import { ArgumentError } from '../resolvers/resolver-types/errors.js';
import { defaultLocale, defaultTimeZone } from '../constants.js';

const NORM_METADATA_KEY = Symbol('normalize_meta');
const VAL_METADATA_KEY = Symbol('validate_meta');

type UserFields = 'email' | 'password' | 'feedUrl' | 'locale' | 'timeZone';
type OptionsFields = 'shareList' | 'customSubject' | 'dailyDigestHour';
type FeedbackFields = 'feedbackText';
type UserFeedFields = 'userFeedTitle';

type InputType = UserFields | OptionsFields | FeedbackFields | UserFeedFields;

export const validates: Record<InputType, AnySchema> = {
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
  feedUrl: Joi.string().uri({
    allowRelative: false,
    scheme: ['http', 'https'],
    domain: {},
  }),
  locale: Joi.string(),
  timeZone: Joi.string(),
  shareList: Joi.array().items(Joi.string()),
  customSubject: Joi.string().max(50),
  dailyDigestHour: Joi.number().integer().max(23).min(0),
  feedbackText: Joi.string().required().max(10000),
  userFeedTitle: Joi.string().max(50).optional().allow(null),
};

const pass = (arg: any) => arg;
export const normalizes: Record<InputType, Function> = {
  email: (arg: string) => arg?.trim().toLowerCase(),
  password: (arg: string) => arg?.trim(),
  feedbackText: (arg: string) => arg?.trim(),
  feedUrl: (arg: string) =>
    normalizeUrl(arg, {
      defaultProtocol: 'https://',
    }),
  locale: (locale: string) => {
    if (!locale) return locale;
    let result: string | undefined;
    try {
      result = DateTime.fromObject({ locale }).resolvedLocaleOpts().locale;
    } catch (error) {
      //
    }
    return result || defaultLocale;
  },
  timeZone: (timeZone: string) => {
    if (!timeZone) return timeZone;
    return DateTime.local().setZone(timeZone).isValid ? timeZone : defaultTimeZone;
  },
  shareList: (arg: Array<string>) => (arg === null ? [] : arg),
  customSubject: pass,
  dailyDigestHour: pass,
  userFeedTitle: (arg: string) => arg?.trim() || null,
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

type SchemaAndPath = [InputSchema: Object, path: string];

export function NormalizeAndValidateArgs(...schemasWithPaths: SchemaAndPath[]): MethodDecorator {
  return createMethodDecorator(async ({ args }, next) => {
    for (const [InputSchema, path] of schemasWithPaths) {
      const argsObj = path ? args[path] : args;
      if (!argsObj) return next();

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
      const { error } = Joi.object(validateSchema).validate(argsObj, { allowUnknown: true });
      if (error) {
        const argumentErrors: ArgumentError[] = error.details.map((e) => ({
          argument: e.context?.key,
          message: e.message,
        }));
        return { errors: argumentErrors };
      }
    }
    return next();
  });
}
