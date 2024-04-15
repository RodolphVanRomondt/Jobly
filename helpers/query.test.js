const { validateQuery } = require("./query");


describe("Validate Query Pass/Fail.", function () {

    test("No Field Is Valid. Returns Empty Object", function () {
        const result = validateQuery({
            "handle": "baker-santos",
            "description": "Compare certain use. Writer time lay word garden. Resource task interesting voice.",
            "numEmployees": 225,
            "logoUrl": "/logos/logo3.png"
        });
        expect(result).toEqual({});
    });

    test("Error. Data Is Not Valid.", function () {
        function err() {
            validateQuery({
                name: "llc",
                minEmployees: "1",
                maxEmployees: "1"
            });
        }
        expect(err).toThrow();
    });

    test("Error. minEmployees is greater than maxEmployees", function () {
        function err() {
            validateQuery({
                name: "llc",
                minEmployees: 10,
                maxEmployees: 1
            });
        }
        expect(err).toThrow();
    });

    test("Returns data", function () {
        const result = validateQuery({
            name: "llc",
            minEmployees: 800,
            maxEmployees: 900
        });
        expect(result).toEqual({
            name: "llc",
            minEmployees: 800,
            maxEmployees: 900
        });
    });

    test("Returns data. Filter Key.", function () {
        const result = validateQuery({
            name: "llc",
            minEmployees: 800,
            willBeFiltered: "YES"
        });
        expect(result).toEqual({
            name: "llc",
            minEmployees: 800
        });
    });

});
