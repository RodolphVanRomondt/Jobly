"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
        title: "new",
        salary: 10000,
        equity: "0",
        company_handle: "c2"
    };

    test("Works", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                ...newJob
            },
        });
    });

    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "new",
                salary: 10000
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                ...newJob,
                logoUrl: "not-a-url",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
    test("ok for anon", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs: [{
                id: expect.any(Number),
                title: 'IT',
                salary: 100000,
                equity: "0.5",
                company_handle: 'c1'
            },
                {
                    id: expect.any(Number),
                    title: 'SE',
                    salary: 150000,
                    equity: "0",
                    company_handle: 'c1'
                }
            ]
        });
    });
});

/************************************** GET /jobs FILTERED */
describe("GET FILTERED /jobs", function () {
    test("Filters jobs by title", async function () {
        const resp = await request(app).get("/jobs").query({ "title": "IT" });
        expect(resp.statusCode).toEqual(200);
        console.log(resp.body);
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: 'IT',
                    salary: 100000,
                    equity: "0.5",
                    company_handle: 'c1'
                }
            ]
        });
    });

    test("Filters jobs by minSalary", async function () {
        const resp = await request(app).get("/jobs").query({ minSalary: 100000 });
        expect(resp.statusCode).toEqual(200);
        console.log(resp.body);
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: 'IT',
                    salary: 100000,
                    equity: "0.5",
                    company_handle: 'c1'
                },
                {
                    id: expect.any(Number),
                    title: 'SE',
                    salary: 150000,
                    equity: "0",
                    company_handle: 'c1'
                }
            ]
        });
    });

    test("Filters jobs by multiple criterias", async function () {
        const resp = await request(app).get("/jobs").query({ hasEquity: true, minSalary: 100000, title: "IT" });
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: 'IT',
                    salary: 100000,
                    equity: "0.5",
                    company_handle: 'c1'
                }
            ]
        });
    });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
    test("works for anon", async function () {
        const result = await db.query(
            `SELECT * FROM jobs
            WHERE title='IT'`);
        
        const resp = await request(app).get(`/jobs/${result.rows[0].id}`);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: 'IT',
                salary: 100000,
                equity: "0.5",
                company_handle: 'c1'
            }
        });
    });

    test("not found for no such jobs", async function () {
        const resp = await request(app).get(`/jobs/0`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
    test("works for users", async function () {
        const result = await db.query(
            `SELECT * FROM jobs
            WHERE title='IT'`);
        
        const resp = await request(app)
            .patch(`/jobs/${result.rows[0].id}`)
            .send({
                title: "Information Technology",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: 'Information Technology',
                salary: 100000,
                equity: "0.5",
                company_handle: 'c1'
            },
        });
    });

    test("unauth for anon", async function () {
        const result = await db.query(
            `SELECT * FROM jobs
            WHERE title='IT'`);
        
        const resp = await request(app)
            .patch(`/jobs/${result.rows[0].id}`)
            .send({
                title: "Information Technology",
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("not found on no such job", async function () {
        const resp = await request(app)
            .patch(`/jobs/0`)
            .send({
                title: "Information Technology",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("bad request on id change attempt", async function () {
        const result = await db.query(
            `SELECT * FROM jobs
            WHERE title='IT'`);
        
        const resp = await request(app)
            .patch(`/jobs/${result.rows[0].id}`)
            .send({
                id: 0,
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on invalid data", async function () {
        const result = await db.query(
            `SELECT * FROM jobs
            WHERE title='IT'`);
        
        const resp = await request(app)
            .patch(`/jobs/${result.rows[0].id}`)
            .send({
                invalidField: "nope",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
    test("works for users", async function () {
        const result = await db.query(
            `SELECT * FROM jobs
            WHERE title='IT'`);
        
        const resp = await request(app)
            .delete(`/jobs/${result.rows[0].id}`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body).toEqual({ deleted: `${result.rows[0].id}` });
    });

    test("unauth for anon", async function () {
        const result = await db.query(
            `SELECT * FROM jobs
            WHERE title='IT'`);
        
        const resp = await request(app)
            .delete(`/jobs/${result.rows[0].id}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such job", async function () {
        const resp = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(404);
    });
});
