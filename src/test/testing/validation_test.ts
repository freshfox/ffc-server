import {ValidationTest} from "../../lib/testing/valdation_test";
import {Validator} from "../../lib";

describe('ValidationTest', function () {

    interface Model {
        aString: string;
        abc: string;
    }

    const schema = Validator.compile<Model>({
        aString: Validator.schema.string().required(),
        abc: Validator.schema.valid('a', 'b', 'c', null)
    });

    ValidationTest.create(schema, {
        aString: 'string',
        abc: 'a'
    })
        .invalid({
            abc: 'd'
        })
        .valid({
            abc: null
        })
        .invalid({
            aString: null
        })
        .invalid({
            aString: 1
        });

});
