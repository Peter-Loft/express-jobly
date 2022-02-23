"use strict";

const sql = require("./sql");
const {sqlForPartialUpdate} = require("./sql");
sql.sqlForPartialUpdate = jest.fn();

describe("Somethign else", function () {
    test('Object has no keys', function () {
        sql.sqlForPartialUpdate
            .mockReturnValue({ error: { message: "No data" } });

        const result = sql.sqlForPartialUpdate(
            {}, {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
        }
        );

        expect(result).toEqual({ error: { message: "No data" } });
    });

    test('Object has one valid key', function () {
        const result = sqlForPartialUpdate(
            {name: "NewComp"}, {
                numEmployees: "num_employees",
                logoUrl: "logo_url",
            }
        );
        //CR Q: Where did the backslashes come from? Shouldn't it 
        // just return "name"="$1"?
        expect(result).toEqual({ setCols: "\"name\"=$1",
            values: ["NewComp"] });
    });

    // test('Invalid key, not in SQL table')
});