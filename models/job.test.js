"use strict";

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

let testJob;

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "DA",
        salary: 100000,
        equity: 0,
        company_handle: "c3"
    };

    test("works", async function () {
        let job = await Job.create(newJob);

        testJob = job
        expect(job).toEqual(
            {
                id: testJob.id,
                title: "DA",
                salary: 100000,
                equity: "0",
                company_handle: "c3"
            }
        );

        const result = await db.query(
            `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'DA'`);
        testJob = result.rows;
        expect(result.rows).toEqual([
            {
                id: testJob.id,
                title: "DA",
                salary: 100000,
                equity: "0",
                company_handle: "c3"
            },
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
    test("works", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: 'CS',
                salary: 200000,
                equity: "0",
                company_handle: 'c3'
            },
            {
                id: expect.any(Number),
                title: 'IT',
                salary: 100000,
                equity: "1",
                company_handle: 'c1'
            },
            {
                id: expect.any(Number),
                title: 'SE',
                salary: 150000,
                equity: "0",
                company_handle: 'c2'
            }
        ]);
    });
});

/**************************** findAndFilter */
describe("Filter Job", function () {
    test("Works: filter by the 3 criterias", async function () {
        const criteriaData = { title: "IT", hasEquity: 0, minSalary: 50000 };
        let jobs = await Job.findAndFilter(criteriaData);
        testJob = jobs[0]
        expect(jobs).toEqual([{
            id: testJob.id,
            title: "IT",
            salary: 100000,
            equity: "1",
            company_handle: "c1"
        }]);
    });

    test("Works: some criteria", async function () {
        const criteriaData = { minSalary: 110000 };
        const jobs = await Job.findAndFilter(criteriaData);
        expect(jobs).toEqual([{
            id: expect.any(Number),
            title: "CS",
            salary: 200000,
            equity: "0",
            company_handle: "c3"
        },
        {
            id: expect.any(Number),
            title: "SE",
            salary: 150000,
            equity: "0",
            company_handle: "c2"
        }]);
    });
});

/************************************** get */

describe("get", function () {
    test("works", async function () {
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'IT'`);
        testJob = result.rows[0];

        let job = await Job.get(testJob.id);
        expect(job).toEqual({
            id: testJob.id,
            title: "IT",
            salary: 100000,
            equity: "1",
            company_handle: "c1"
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("update", function () {
    const updateData = {
        title: "Information Technology",
        salary: 150000,
        equity: "1",
        company_handle: "c3"
    };

    test("Works: filter by the 4 criterias", async function () {
        const res = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'IT'`);
        
        testJob = res.rows[0];

        let job = await Job.update(testJob.id, updateData);
        expect(job).toEqual({
            id: testJob.id,
            ...updateData,
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${testJob.id}`);
        
        expect(result.rows).toEqual([{
            id: testJob.id,
            ...updateData,
        }]);
    });

    test("not found if no such company", async function () {
        try {
            await Job.update(0, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        try {
            await Job.update(0, {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        const job = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'IT'`);

        testJob = job.rows[0];

        await Job.remove(testJob.id);
        const res = await db.query(
            `SELECT id FROM jobs WHERE id=${testJob.id}`);
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such job", async function () {
        try {
            await Job.remove(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
