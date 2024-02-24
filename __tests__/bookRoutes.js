process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

let testBook;

beforeEach(async () => {
  testBook = await Book.create({
    isbn: "1122334455",
    amazon_url: "http://amazon.com",
    author: "John Doe",
    language: "english",
    pages: 1000,
    publisher: "Test Books Publishing",
    title: "Testing In Jest",
    year: 2024,
  });
});

afterEach(async () => {
  await db.query(`DELETE FROM books`);
});

afterAll(async () => {
  await db.end();
});

/** GET  "/books" => gets all books */

describe("GET /books", () => {
  test("gets an array of all books in the database", async () => {
    let res = await request(app).get("/books");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ books: [testBook] });
  });
});

/** GET "/books/:isbn" => gets one specified book */

describe("GET /books/:isbn", () => {
  test("gets a single book from a matching isbn property", async () => {
    let res = await request(app).get("/books/1122334455");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ book: testBook });
  });
  test("throws an error for non-existent isbn", async () => {
    let res = await request(app).get("/books/1111111111");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: {
        message: "There is no book with an isbn '1111111111'",
        status: 404,
      },
    });
  });
});

/** POST "/books" => creates a new book in the database */

describe("POST /books", () => {
  test("creates a new book entry in the database", async () => {
    let newBook = {
      isbn: "2233445566",
      amazon_url: "http://amazon.com",
      author: "Joe Schmo",
      language: "english",
      pages: 2000,
      publisher: "Test Books Publishing",
      title: "My Book is Longer Than J.Doe's",
      year: 2024,
    };
    let res = await request(app).post("/books").send(newBook);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ book: newBook });
  });
  test("throws error for invalid book data (missing property)", async () => {
    let badBook = {
      isbn: "3344556677",
      amazon_url: "http://amazon.com",
      author: "Joe Schmo",
      language: "english",
      pages: 50,
      publisher: "Test Books Publishing",
      title: "This is a Bad Book",
    };
    let res = await request(app).post("/books").send(badBook);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: {
        message: ['instance requires property "year"'],
        status: 400,
      },
    });
  });
});

/** PUT "/books/:isbn" => updates a specified book  */

describe("PUT /books/:isbn", () => {
  test("updates a book with a matching isbn property", async () => {
    let updatedBook = {
      isbn: "1122334455",
      amazon_url: "http://amazon.com",
      author: "Jane Doe",
      language: "english",
      pages: 500,
      publisher: "Test Books Publishing",
      title: "Testing Express Routes In Jest",
      year: 2024,
    };
    let res = await request(app).put("/books/1122334455").send(updatedBook);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ book: updatedBook });
  });
  test("throws error for invalid update data (missing property)", async () => {
    let badBook = {
      isbn: "1122334455",
      amazon_url: "http://amazon.com",
      author: "Jane Doe",
      language: "english",
      pages: 500,
      publisher: "Test Books Publishing",
      title: "Testing Express Routes In Jest",
      title: "This is a Bad Book",
    };
    let res = await request(app).put("/books/1122334455").send(badBook);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: {
        message: ['instance requires property "year"'],
        status: 400,
      },
    });
  });
});

/** DELETE "/books/:isbn" => deletes a specified book */

describe("DELETE /books/:isbn", () => {
  test("deletes a book with a matching isbn property", async () => {
    let res = await request(app).delete("/books/1122334455");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Book deleted" });
  });
  test("throws an error for non-existent isbn", async () => {
    let res = await request(app).delete("/books/1111111111");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: {
        message: "There is no book with an isbn '1111111111'",
        status: 404,
      },
    });
  });
});
