// test books toutes

process.env.NODE_ENV = "test";

const request = require("supertest");
const express = require("express");
const Book = require("../models/book");
const app = require("../app");
const db = require("../db");
app.use(express.json());
let book_isbn;

beforeEach(async () => {
    let result = await db.query(`
    INSERT INTO 
    books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES(
        '1234321234',
        'https://amazon.com/taco',
        'Elie',
        'English',
        100,
        'Nothing publishers',
        'my first book',
        2008)
        RETURNING isbn`);
    book_isbn = result.rows[0].isbn;
}
);

describe("POST /books", async function () {
    test("Creates a new book", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({
                isbn: "32794782",
                amazon_url: "https://amazon.com/taco",
                author: 'Elie',
                language: 'English',
                pages: 100,
                publisher: 'Nothing publishers',
                title: 'my first book',
                year: 2008})
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty("isbn");
    });
    test("Prevents creating book without required title", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({
                isbn: "32794782",
                amazon_url: "https://amazon.com/taco",
                author: 'Elie',
                language: 'English',
                pages: 100,
                publisher: 'Nothing publishers',
                title: 'my first book',
                year: 2008})
        expect(response.statusCode).toBe(400);
    }
    );
});

describe("GET /books", async function () {
    test("Gets a list of 1 book", async function () {
        const response = await request(app).get(`/books`);
        const books = response.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty("isbn");
        expect(books[0]).toHaveProperty("amazon_url");
    });
}
);

describe("GET /books/:id", async function () {
    test("Gets a single book", async function () {
        const response = await request(app).get(`/books/${book_isbn}`);
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(book_isbn);
    });
    test("Responds with 404 if can't find book", async function () {
        const response = await request(app).get(`/books/999`);
        expect(response.statusCode).toBe(404);
    });
}
);

describe("PUT /books/:id", async function () {
    test("Updates a single book", async function () {
        const response = await request(app)
            .put(`/books/${book_isbn}`)
            .send({
                isbn: "32794782",
                amazon_url: "https://amazon.com/taco",
                author: 'Elie',
                language: 'English',
                pages: 100,
                publisher: 'Nothing publishers',
                title: 'my first book',
                year: 2008})
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(book_isbn);
    });
    test("Prevents a bad book update", async function () {
        const response = await request(app)
            .put(`/books/${book_isbn}`)
            .send({
                isbn: "32794782",
                amazon_url: "https://amazon.com/taco",
                author: 'Elie',
                language: 'English',
                pages: 100,
                publisher: 'Nothing publishers',
                title: 'my first book',
                year: 2008})
        expect(response.statusCode).toBe(400);
    });
    test("Responds 404 if can't find book", async function () {
        // delete book first
        await request(app).delete(`/books/${book_isbn}`);
        const response = await request(app).delete(`/books/${book_isbn}`);
        expect(response.statusCode).toBe(404);
    });
}
);

describe("DELETE /books/:id", async function () {
    test("Deletes a single a book", async function () {
        const response = await request(app)
            .delete(`/books/${book_isbn}`)
        expect(response.body).toEqual({ message: "Book deleted" });
    });
}
);

afterEach(async function () {
    await db.query("DELETE FROM books");
}
);

afterAll(async function () {
    await db.end();
}
);


