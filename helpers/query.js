const { BadRequestError } = require("../expressError");


/*
* Gets an Object that has 1, 2 or 3 of those keys
* ... {name, minEmployees, maxEmployees}
*
Returns an Object, {setCols: "...", values: [...]},
* to be use by the Company.findAndFilter() method
*
* Where setCols is a string representing part of a SQL query
* and values is an Array of parameterized data.
*/
function validateQuery(queryObject) {

    const cols = [];
    let idx = 0;

    for (let key of Object.keys(queryObject)) {
        if (key === "minEmployees") {
            idx += 1;
            cols.push(`num_employees>=$${idx}`);
        }
        else if (key === "maxEmployees") {
            idx += 1;
            cols.push(`num_employees<=$${idx}`);
        }
        else if (key === "name") {
            cols.push(`name ILIKE '%${queryObject[key]}%'`);
        }
    }

    return {
        setCols: cols.join(" AND "),
        values: Object.values(queryObject).filter(ele => ele !== queryObject.name)
    };
}


module.exports = { validateQuery };
