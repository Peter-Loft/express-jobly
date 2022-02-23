const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/** Prepare variables for sanitization/naming convention and UPDATE query
 * 
 * Takes in object of data and object of js variable keys with sql variable values
 * 
 * Returns { setCols: "first_name=$1, ...", values: [value_$1, value_$2, ...] }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

function prepareCompanyFilters(filters) {
  const keys = Object.keys(filters);
  if (keys.length === 0) return;

  

}

module.exports = { sqlForPartialUpdate };