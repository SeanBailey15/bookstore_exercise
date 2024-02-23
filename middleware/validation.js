const ExpressError = require("../expressError");
const validate = require("jsonschema").validate;
const bookSchema = require("../schemas/bookSchema.json");

function validateBookData(req, res, next) {
  try {
    const result = validate(req.body, bookSchema);
    if (!result.valid) {
      const listOFErrors = result.errors.map((e) => e.stack);
      throw new ExpressError(listOFErrors, 400);
    }
    return next();
  } catch (err) {
    next(err);
  }
}

module.exports = validateBookData;
