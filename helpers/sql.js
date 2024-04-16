const { BadRequestError } = require("../expressError");


/*
* Gets a first argument of object to reformat to another object
* {school: "Springboard", track: "Software Engineering"}
* 
* The second argument is an object that modifies the keys of the first
* object with the corresponding values, if there is a match.

* Throws BadRequestError if the first argument if empty.
*
* returns {setCols, values}
* setCols is a string with the name of the different field to Update
*     ex.: "'school'=$1, 'track'=$2"
* values is an Array of the values of the first object
*     ex.: ["Springboard", "Software Engineering"]
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  const cols = keys.map((colName, idx) =>
      `${jsToSql[colName] || colName}=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


module.exports = sqlForPartialUpdate;
