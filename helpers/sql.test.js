const { sqlForPartialUpdate } = require("./sql");

describe("Partial Update Pass/Fail.", function () {

    const objectInput = {
        school: "Springboard",
        track: "Software Engineering"
    };

    test("No Data In Object. Throws Error", function () {
        function err() {
            sqlForPartialUpdate({}, {});
        }
        expect(err).toThrow();
    });

    test("Missing Argument", function () {
        function err() {
            sqlForPartialUpdate(objectInput);
        }
        expect(err).toThrow();
    });

    test("Returns data", function () {
        const result = sqlForPartialUpdate(objectInput, {});
        expect(result).toEqual({
            setCols: "'school'=$1, 'track'=$2",
            values: ["Springboard", "Software Engineering"]
        });
    });

    test("Returns data. Modifies Keys.", function () {
        const result = sqlForPartialUpdate(objectInput, {
            school: "Bootcamp",
            track: "Carrer Track"
        });
        expect(result).toEqual({
            setCols: "'Bootcamp'=$1, 'Carrer Track'=$2",
            values: ["Springboard", "Software Engineering"]
        });
    });

});
