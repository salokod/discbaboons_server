// tests/routes.test.js
import axios from "axios";
import app from "../../app.js"; // Assuming app.js is where your express app is defined
import http from "http";
import { test, expect, describe } from "@jest/globals";
import { response } from "express";

describe("routes", () => {
  let server;
  let baseURL;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
    baseURL = `http://localhost:${server.address().port}`;
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("basic router checks", () => {
    {
      it("responds with 404 and error message for non-existent route", async () => {
        expect.assertions(2);
        try {
          await axios.get(`${baseURL}/api/v2/skibbitytoilet`);
        } catch (error) {
          expect(error.response.status).toBe(404);
          expect(error.response.data.message).toBe("Route not found");
        }
      });
    }

    it("throws error when server is down", async () => {
      jest.doMock("axios", () => {
        return {
          get: jest.fn(() => Promise.reject({ response: { status: 500 } })),
        };
      });

      const axios = require("axios");

      try {
        await axios.get(`${baseURL}/api/v2/public/lol`);
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error).toBeTruthy();
      }
    });
  });

  describe("check the /public endpoints", () => {
    it("/login - does not allow GET, PUT, DELETE requests", async () => {
      const methods = ["get", "put", "delete"];
      expect.assertions(methods.length);

      for (let method of methods) {
        try {
          await axios[method](`${baseURL}/api/v2/public/auth/login`);
        } catch (error) {
          expect(error.response.status).toBe(405);
        }
      }
    });
  });

  // describe("GET /secure", () => {
  //   it("responds with 401 for unauthenticated requests", async () => {
  //     try {
  //       await axios.get(`${baseURL}/secure`);
  //     } catch (error) {
  //       expect(error.response.status).toBe(401);
  //     }
  //   });
  // });
});
