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

  static async create({title, salary, equity, companyHandle}) {
    const duplicateCheck = await db.query(`
      SELECT title
        FROM jobs
        WHERE title = $1
    `, [title]);

    if (duplicateCheck.rows[0]){
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
        RETURNING id, title, salary, equity, company_handle AS "compayHandle"`,
        [title, salary, equity, companyHandle]
    );

    const job =result.rows[0];
    return job;

  }
}