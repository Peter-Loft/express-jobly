"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for jobs. */

class Job {
  /** Create a Job (from data), update db, return new Job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if Job already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const duplicateCheck = await db.query(`
      SELECT title
        FROM jobs
        WHERE title = $1
    `, [title]);

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate Job: ${title}`);
    }

    const result = await db.query(
      `INSERT INTO jobs(
        title, 
        salary, 
        equity, 
        company_handle
      )
        VALUES ($1,$2, $3, $4)
        RETURNING title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );

    const job = result.rows[0];
    return job;

  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
      FROM jobs`
    );
    if (!jobsRes.rows[0]) throw new NotFoundError(`No jobs found`);

    return jobsRes.rows;

  }

  /** Find all jobs within the matching filters.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAllWithFilter(filter) {

    const jobsRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
      FROM jobs
      WHERE ${filter.filterStatement}`, filter.values
    );
    if (!jobsRes.rows[0]) throw new NotFoundError(`No jobs found`);

    return jobsRes.rows;

  }


  /** Converting query string arguments to object of psql statement strings
   * 
   * Takes in paramets from query string
   * 
   * Returns { filterStatement: "name=$1, ...", values: [value_$1, ...] }
   */
  static prepareJobFilters(filters) {
    const keys = Object.keys(filters);
    if (keys.length === 0) return;

    let whereQuery = [];
    let filterValues = [];
    let i = 1;

    if ("title" in filters) {
      whereQuery.push(`title ILIKE $${i++}`);
      filterValues.push(`%${filters['title']}%`);
    }

    if ("minSalary" in filters) {
      whereQuery.push(`salary >= $${i++}`);
      filterValues.push(Number(filters['minSalary']));
    }

    if ("hasEquity" in filters && filters.hasEquity === true) {
      whereQuery.push(`equity > 0`)
    }

    return {
      filterStatement: whereQuery.join(" AND "),
      values: filterValues,
    }
  }


}

module.exports = Job;