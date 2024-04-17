"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { jobValidateQuery } = require("../helpers/query");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for jobs. */
class Job {

    /** Create a job (from data), update db, return new job data.
     *
     * data should be { id, title, salary, equity, company_handle }
     *
     * Returns { id, title, salary, equity, company_handle }
     *
     * Throws BadRequestError if job already in database.
     **/
    static async create({ title, salary, equity, company_handle }) {
        const duplicateCheck = await db.query(
            `SELECT id
           FROM jobs
           WHERE title = $1`,
            [title]);

        if (duplicateCheck.rows[0])
            throw new BadRequestError(`Duplicate job: ${duplicateCheck.rows[0].id}`);

        const result = await db.query(
            `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
            [
                title,
                salary,
                equity,
                company_handle
            ],
        );
        const job = result.rows[0];

        return job;
    }

    /** Find all jobs.
     *
     * Returns [{ id, title, salary, equity, company_handle }, ...]
     *
     */
    static async findAll() {
        const jobsRes = await db.query(
            `SELECT id,
                title,
                salary,
                equity,
                company_handle
           FROM jobs
           ORDER BY title`);
        return jobsRes.rows;
    }

    /** Find all jobs that are match by title, minSalary and hasEquity
    *
    * Returns [{id, title, salary, equity, company_handle}, ...]
    * 
    **/
    static async findAndFilter(data) {

        const { setCols, values } = jobValidateQuery(data);

        const querySql = `SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle
                        FROM jobs
                        WHERE ${setCols}
                        ORDER BY title`;

        const results = await db.query(querySql, [...values]);

        return results.rows;
    }

    /** Given a job id, return data about job.
     *
     * Returns { id, title, salary, equity, company_handle }
     *   where company_handle is [{ handle, name, description ... }, ...]
     *
     * Throws NotFoundError if not found.
     **/
    static async get(id) {
        const jobRes = await db.query(
            `SELECT id,
                title,
                salary,
                equity,
                company_handle
           FROM jobs
           WHERE id = $1`,
            [id]);

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }

    /** Update job data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: {title, salary, equity, company_handle}
     *
     * Returns {id, title, salary, equity, company_handle}
     *
     * Throws NotFoundError if not found.
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {});
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id,
                        title,
                        salary,
                        equity,
                        company_handle`;

        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }

    /** Delete given job from database; returns undefined.
     *
     * Throws NotFoundError if job not found.
     **/
    static async remove(id) {
        const result = await db.query(
            `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
            [id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
    }
}


module.exports = Job;
