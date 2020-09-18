import {Schema} from "joi";
import * as should from "should";
import * as flat from 'flat';
import {TypedSchema, Validator} from "../validation/validator";

type AnyValue<T> = { [key in keyof T]: any | T[key] };

export class ValidationTest<T> {

    static create<T>(schema: TypedSchema<T>, validData: T) {
        return new ValidationTest<T>(schema, validData);
    }

    constructor(private schema: Schema, private validData: T) {
        this.valid(this.validData);
    }

    private static stringify(obj: any) {
        const flattend = flat(obj);
        return Object.keys(flattend).map((k) => {
            let val = flattend[k];
            if (Array.isArray(val)) {
                val = `[${val.toString()}]`;
            } else if (val && typeof val === 'object') {
                val = `{${this.stringify(val)}}`;
            }
            return `${k}=${val}`;
        }).join(',');
    }

    valid(data: Partial<T>) {
        const name = data !== this.validData ? ValidationTest.stringify(data) : '';
        it('test valid data ' + name, () => {
            return should(Validator.validate({
                ...this.validData,
                ...data
            }, this.schema)).resolved();
        });
        return this;
    }

    invalid(data: Partial<AnyValue<T>>) {
        const name = ValidationTest.stringify(data);
        it('test invalid data ' + name, async () => {
            const testingData = {
                ...this.validData,
                ...data
            };
            const error = await should(Validator.validate(testingData, this.schema)).rejected();
            const flatten = flat(data);
            const keys = Object.keys(flatten);
            should(error.errors).length(keys.length);
            for (const key of keys) {
                const err = error.errors.find(e => e.path.join('.') === key);
                should(err).not.undefined();
            }
        });
        return this;
    }
}
