"use strict";

const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError, NotFoundError } = require("../expressError");

describe("Somethign else", function () {
    test('Object has no keys', function () {
        try {
            sqlForPartialUpdate({})
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }

    });

    test('Works', function () {
        const result = sqlForPartialUpdate(
            { name: "NewComp" }, {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
        }
        );
        //CR Q: Where did the backslashes come from? Shouldn't it 
        // just return "name"="$1"?
        expect(result).toEqual({
            setCols: "\"name\"=$1",
            values: ["NewComp"]
        });
    });

    test('Does not work without jsToSql', function () {
        try {
            const result = sqlForPartialUpdate({ name: "NewComp" });
        } catch (err) {
            expect(err instanceof TypeError).toBeTruthy();
        }
    });

});