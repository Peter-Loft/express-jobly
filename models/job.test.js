const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  const newJob = {
    title: "New Position",
    salary: 100000,
    equity: "0",
    companyHandle: "c1"
  }

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(`
      SELECT title, salary, equity, company_handle AS "companyHandle"
        FROM jobs
        WHERE title = 'New Position'
    `);

    expect(result.rows).toEqual([
      {
        title: "New Position",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
      }
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filters", async function () {
    const jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "Conservator, furniture",
        salary: 110000,
        equity: "0",
        companyHandle: "c1"
      },
      {
        id: testJobIds[1],
        title: "Information officer",
        salary: 200000,
        equity: "0",
        companyHandle: "c1"
      },
      {
        id: testJobIds[2],
        title: "Consulting civil engineer",
        salary: 60000,
        equity: "0",
        companyHandle: "c3"
      }]);

  });
});

/************************************** findAllWithFilter */

describe("findAllWithFilter", function () {
  test("works with filter", async function () {
    const filter = {
      filterStatement: "salary >= $1",
      values: [100000],
    }
    const results = await Job.findAllWithFilter(filter);
    expect(results).toEqual(
      [{
        id: testJobIds[0],
        title: "Conservator, furniture",
        salary: 110000,
        equity: "0",
        companyHandle: "c1"
      },
      {
        id: testJobIds[1],
        title: "Information officer",
        salary: 200000,
        equity: "0",
        companyHandle: "c1"
      }]);
  });

  test("works with filter", async function () {
    const filter = {
      filterStatement: "salary >= $1",
      values: [1000000],
    }
    try {
      const results = await Job.findAllWithFilter(filter);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


describe("prepareJobFitlers", function () {
  test('Single parameter', function () {
    const filter = {
      "title": "New Job Title"
    };

    const result = Job.prepareJobFilters({
      "title": "New Job Title"
    });

    expect(result).toEqual({
      filterStatement: "title ILIKE $1",
      values: ["%New Job Title%"]
    });
  });

  test('Two parameters', function () {
    const filter = {
      "title": "New Job Title",
      "minSalary": 100000
    };

    const result = Job.prepareJobFilters(filter);

    expect(result).toEqual({
      filterStatement: "title ILIKE $1 AND salary >= $2",
      values: ["%New Job Title%", 100000]
    });
  });

  test('Four parameters (ignore(s) extra parameter)', function () {
    const filter = {
      title: "New Job Title",
      minSalary: 100000,
      hasEquity: true,
      "bogus-argument": "sobogus"
    };

    const result = Job.prepareJobFilters(filter);

    expect(result).toEqual({
      filterStatement:
        `title ILIKE $1 AND salary >= $2 AND equity > 0`,
      values: ["%New Job Title%", 100000]
    });
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let company = await Job.get("Conservator, furniture");
    expect(company).toEqual({
      title: "Conservator, furniture",
      salary: "110000",
      equity: "0",
      companyHandle: "c1",
    });
  });

  test("not found if no such company", async function () {
    try {
      await Company.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "Updated Job Title",
    salary: "1",
    equity: 20,
    companyHandle: "Updated Comp Handle",
  };

  test("works", async function () {
    let job = await Job.update("Conservator, furniture", updateData);
    expect(job).toEqual({
      ...updateData,
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      ...updateData,
      // title: "Updated Job Title",
      // salary: "1",
      // equity: 20,
      // companyHandle: "Updated Comp Handle",
    }]);
  });

  test("works: null fields", async function () {
    const updateData = {
      title: "Updated Job Title",
      salary: "1",
      equity: null,
      companyHandle: null,
    };

    let company = await Company.update("c1", updateData);
    expect(company).toEqual({
      ...updateData,
    });

    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: null,
      logo_url: null,
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Company.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Company.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});