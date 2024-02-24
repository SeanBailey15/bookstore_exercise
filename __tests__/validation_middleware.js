process.env.NODE_ENV = "test";

const validateBookData = require("../middleware/validation");
const validate = require("jsonschema").validate;
const ExpressError = require("../expressError");

jest.mock("jsonschema");

describe("validateBookData middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {};
    next = jest.fn();
  });

  test("Will pass validation", () => {
    req.body = {
      isbn: "0691161518",
      amazon_url: "http://a.co/eobPtX2",
      author: "Matthew Lane",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    };

    validate.mockReturnValueOnce({ valid: true });

    validateBookData(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("Will fail validation with an error", () => {
    req.body = {};

    validate.mockReturnValueOnce({
      valid: false,
      errors: [{ stack: "Some validation error" }],
    });

    validateBookData(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new ExpressError("Some validation error", 400)
    );
  });
});
