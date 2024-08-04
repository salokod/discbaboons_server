// tests/routes.test.js
import axios from "axios";
import app from "../../../app.js";
import http from "http";
import { expect, describe, it } from "@jest/globals";
import Chance from "chance";

const chance = new Chance();

describe("check the /protected/bag endpoints", () => {
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

  it("/protected/bag/addbag - returns 401 if token isn't provided", async () => {
    try {
      await axios.post(`${baseURL}/api/v2/protected/bag/add`);
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it("/protected/bag/addbag - returns 401 if token isn't correct", async () => {
    try {
      await axios.post(`${baseURL}/api/v2/protected/bag/add`, { token: chance.hash() });
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });
});
