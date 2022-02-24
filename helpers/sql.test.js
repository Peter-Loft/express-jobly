"use strict";

const { sqlForPartialUpdate, prepareCompanyFilters } = require("./sql");
const { BadRequestError, NotFoundError } = require("../expressError");

describe("sqlForPartialUpdate function tests", function () {
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

describe("prepareCompanyFilters function tests", function () {
    test('Single parameter', function () {
        const filter = {
            "name":"New Company Name"
        };

        const result = prepareCompanyFilters(filter);

        expect(result).toEqual({
            filterStatement: "name ILIKE $1",
            values: ["%New Company Name%"]
        });
    });

    test('Two parameters', function () {
        const filter = {
            "name":"New Company Name",
            "minEmployees":"500"
        };

        const result = prepareCompanyFilters(filter);

        expect(result).toEqual({
            filterStatement: "name ILIKE $1 AND num_employees >= $2",
            values: ["%New Company Name%", 500]
        });
    });

    test('Four parameters (ignore(s) extra parameter)', function () {
        const filter = {
            "name":"New Company Name",
            "minEmployees":"500",
            "maxEmployees":"1500",
            "bogus-argument":"sobogus"
        };

        const result = prepareCompanyFilters(filter);

        expect(result).toEqual({
            filterStatement: 
            `name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3`,
            values: ["%New Company Name%", 500, 1500]
        });
    });
});