// tests/routes.test.js
import { findOneUserName } from "../../controllers/userDatabaseDynamo.js";
import axios from "axios";
import app from "../../app.js"; // Assuming app.js is where your express app is defined
import http from "http";
import bcrypt from "bcrypt";
import { expect, describe } from "@jest/globals";
import { addToList } from "../../utils/authUtils.js";

jest.mock("../../utils/authUtils.js"); // replace with your actual file

jest.mock("../../controllers/userDatabaseDynamo.js", () => ({
  findOneUserName: jest.fn(), // Change this line
}));

jest.mock("bcrypt", () => ({
  compareSync: jest.fn(),
}));

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
      // jest.doMock("axios", () => {
      //   return {
      //     get: jest.fn(() => Promise.reject({ response: { status: 500 } })),
      //   };
      // });

      const axios = require("axios");

      try {
        await axios.get(`${baseURL}/api/v2/public/error`);
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
          const dataForMock = {
            Items: [{ username: "existingUser" }],
            Count: 1,
            ScannedCount: 1,
          };
          findOneUserName.mockResolvedValue(dataForMock);
          await axios[method](`${baseURL}/api/v2/public/auth/login`);

          expect(true).toBe(false);
        } catch (error) {
          expect(error.response.status).toBe(405);
        }
      }
    });

    //test that returns 400 if username is less than 3 characters
    it("/login - returns 400 if username is less than 3 characters", async () => {
      try {
        const dataForMock = {
          Items: [{ username: "existingUser" }],
          Count: 1,
          ScannedCount: 1,
        };
        bcrypt.compareSync.mockReturnValue(true);
        findOneUserName.mockResolvedValue(dataForMock);
        await axios.post(`${baseURL}/api/v2/public/auth/login`, {
          username: "hi",
          password: "password",
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
    it("/login - returns 400 if username is greater than 30 characters", async () => {
      try {
        const dataForMock = {
          Items: [{ username: "existingUser" }],
          Count: 1,
          ScannedCount: 1,
        };
        findOneUserName.mockResolvedValue(dataForMock);
        bcrypt.compareSync.mockReturnValue(true);

        await axios.post(`${baseURL}/api/v2/public/auth/login`, {
          //username is 31 characters long
          username: "12345678123456781234567812345678",
          password: "password",
        });
        //make sure the test fails if the above request does not throw an error
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
    it("/login - returns two cookies if successfull", async () => {
      try {
        const dataForMock = {
          Items: [{ username: "existingUser" }],
          Count: 1,
          ScannedCount: 1,
        };
        findOneUserName.mockResolvedValue(dataForMock);
        addToList.mockResolvedValue(true);
        bcrypt.compareSync.mockReturnValue(true);

        const response = await axios.post(`${baseURL}/api/v2/public/auth/login`, {
          username: "username",
          password: "password",
        });

        expect(response.status).toEqual(200);
        const cookies = response.headers["set-cookie"];

        expect(cookies).toBeDefined();
        expect(cookies.length).toEqual(2);
        const cookieNames = cookies.map((cookie) => cookie.split(";")[0].split("=")[0]);
        expect(cookieNames).toContain("_baboon_act");
        expect(cookieNames).toContain("_baboon_rt");
        //make sure the test fails if the above request does not throw an error
      } catch {
        expect(true).toBe(false);
      }
    });
    it("/login - returns 400 if user doesn't exists", async () => {
      try {
        // Mock the response from findOneUserName
        const dataForMock = {
          Items: [],
          Count: 0,
          ScannedCount: 0,
        };
        bcrypt.compareSync.mockReturnValue(true);
        addToList.mockResolvedValue(true);

        findOneUserName.mockResolvedValue(dataForMock);

        await axios.post(`${baseURL}/api/v2/public/auth/login`, {
          username: "existingUser",
          password: "password",
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
    it("/login - returns true if the password is valid", async () => {
      try {
        findOneUserName.mockResolvedValue({
          Count: 1,
          Items: [{ password: "hashedPassword" }],
        });
        bcrypt.compareSync.mockReturnValue(true);
        addToList.mockResolvedValue(true);

        const password = "password";
        const hashPassword = "hashedPassword";

        const validPassword = bcrypt.compareSync(password, hashPassword);

        const response = await axios.post(`${baseURL}/api/v2/public/auth/login`, {
          username: "existingUser",
          password: "password1",
        });
        expect(validPassword).toBe(true);
        expect(response.status).toBe(200);
      } catch {
        expect(true).toBe(false);
      }
    });

    it("/login - returns false if the password is invalid", async () => {
      try {
        findOneUserName.mockResolvedValue({
          Count: 1,
          Items: [{ password: "hashedPassword" }],
        });
        bcrypt.compareSync.mockReturnValue(false);

        await axios.post(`${baseURL}/api/v2/public/auth/login`, {
          username: "existingUser",
          password: "password1",
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
