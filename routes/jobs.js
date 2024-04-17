"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNewSchema.json");
const jobUpdateSchema = require("../schemas/jobUpdateSchema.json");
const jobQuerySearch = require("../schemas/jobQuerySearch.json");

const router = new express.Router();


/* POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: login
 */
router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * - minSalary
 * - hasEquity
 * - titleLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
    try {

        if (req.query.hasEquity === false) {
            delete req.query.hasEquity;
        }

        if (Object.keys(req.query).length) {
            if (jsonschema.validate(req.query, jobQuerySearch).valid) {

                if (req.query.hasEquity === true) {
                    req.query.hasEquity = 0;
                }

                const jobs = await Job.findAndFilter(req.query);
                return res.json({ jobs });
            }

            const er = jsonschema
                .validate(req.query, jobQuerySearch)
                .errors
                .map(e => e.stack);
            throw new BadRequestError(er, 400);
        }

        const jobs = await Job.findAll();
        return res.json({ jobs });

    } catch (err) {
        return next(err);
    }
});

/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, company_handle }
 *   where company_handle is [{ handle, name,  }, ...]
 *
 * Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { job: { id, title, salary, equity, company_handle } }
 *
 * Authorization required: login
 */
router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/* DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login
 */
router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
