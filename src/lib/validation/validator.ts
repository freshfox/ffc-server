import {Schema, SchemaLike, ValidationOptions} from "@hapi/joi";
import * as Joi from "@hapi/joi";

export type CreateErrorFunction = (message: string, details: any) => Error;

export class Validator {

    private static createError: CreateErrorFunction = (message, details) => {
        return new Error(message)
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

    static compile<T>(schema: SchemaMap<T>) {
        return Joi.compile(schema)
    }

    static setErrorFunction(func: CreateErrorFunction) {
        this.createError = func;
    }
}

export type TypedSchema<T> = Schema;

type SchemaMap<T> = SchemaLike | SchemaLike[] | {[SK in keyof Required<T>]: SchemaMap<T[SK]> }

interface Model {
    name: string;
    address: {
        street: string;
        postal: number;
        city: string;
    }
}

type ValidatorModel = SchemaMap<Model>;

const asd: ValidatorModel = {
    name: '',
    address: {
        street: ''
    }
};
