const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  const newJob = {
    title: "New Position",
    salary: 100000,
    equity: 0.0,
    companyHandle: "c1"
  }

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(`
      SELECT title, salary, equity, company_handle
        FROM jobs
        WHERE title = 'New Position'
    `);

    expect(result.rows).toEqual([
      {
        title: "New Position",
        salary: 100000,
        equity: 0.0,
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

// 
describe("findAll", function () {
  test("works: no filters", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      { id: 1,
      title: "Conservator, furniture",
      salary: 110000,
      equity: 0,
      companyHandle: "c1"
    },
      { id: 2,
      title: "Information officer",
      salary: 200000,
      equity: 0,
      companyHandle: "c1"
    },
      { id: 3,
      title: "Consulting civil engineer",
      salary: 60000,
      equity: 0,
      companyHandle: "c3"
    }]);

  });
});

/************************************** findAllWithFilter */

