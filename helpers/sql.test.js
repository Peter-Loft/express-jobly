"use strict";

const sql = require("./sql");
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

    
});