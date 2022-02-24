const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/** Prepare variables for sanitization/naming convention and UPDATE query
 * 
 * Takes in object of data and object of js variable keys with sql variable values
 * 
 * Returns { setCols: "first_name=$1, ...", values: [value_$1, value_$2, ...] }
 */
//CR Provide example of what is taken in, in DOCstring
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

/** Converting query string arguments to object of psql statement strings
 * 
 * Takes in paramets from query string
 * 
 * Returns { filterStatement: "name=$1, ...", values: [value_$1, ...] }
*/
//CR Probably would be beter as static method in company model.
function prepareCompanyFilters(filters) {
  const keys = Object.keys(filters);
  if (keys.length === 0) return;

  let whereQuery = [];
  let filterValues = [];
  let i = 1;
  //CR can drop the for loop. If name in filters.
  for (let key in filters) {
    if (key === "name") {
      whereQuery.push(`name ILIKE $${i}`);
      filterValues.push(`%${filters[key]}%`);
      i++;
      //CR can add ++ after line 43 ${i - This will return current and then incrment.

    } else if (key === "minEmployees") {
      whereQuery.push(`num_employees >= $${i}`);
      filterValues.push(Number(filters[key]));
      i++;

    } else if (key === "maxEmployees") {
      whereQuery.push(`num_employees <= $${i}`);
      filterValues.push(Number(filters[key]));
      i++;

    }
  }

  return {
    filterStatement: whereQuery.join(" AND "),
    values: filterValues,
  };

}

module.exports = {
  sqlForPartialUpdate,
  prepareCompanyFilters
};