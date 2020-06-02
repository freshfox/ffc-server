import {Schema, SchemaLike, ValidationOptions} from "@hapi/joi";
import * as Joi from "@hapi/joi";

export type TypedSchema<T> = Schema;
export type SchemaMap<T> = SchemaLike | SchemaLike[] | {[SK in keyof Required<T>]: SchemaMap<T[SK]> }
export type CreateErrorFunction = (message: string, errors: any) => IValidationError;

export interface IValidationError {
    errors: any;
}

export class ValidationError extends Error implements IValidationError {

    constructor(msg: string, public readonly errors: any) {
        super(msg);
    }

}

export class Validator {

    private static createError: CreateErrorFunction = (message, errors) => {
        return new ValidationError(message, errors)
    }

    private static DEFAULT_OPTIONS: ValidationOptions = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
    };

    static async validate<T>(value: T, schema: TypedSchema<T>): Promise<T> {
        try {
            // Await is required here to make try/catch work
            const result = await schema.validate(value, this.DEFAULT_OPTIONS) as any;
            if (result.error) {
                // noinspection ExceptionCaughtLocallyJS
                throw result.error;
            }
            return result.value;
        } catch (err) {
            throw this.createError(err.message, err.details);
        }
    }

    static get schema() {
        return Joi;
    }

    static compile<T>(schema: SchemaMap<T>): TypedSchema<T> {
        return Joi.compile(schema)
    }

    static setErrorFunction(func: CreateErrorFunction) {
        this.createError = func;
    }
}
