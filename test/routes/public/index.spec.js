// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import bcrypt from 'bcrypt';
import { expect, describe } from '@jest/globals';
import Chance from 'chance';
import { findOneUserByEmail, findOneUserName, addUserToUserDatabase } from '../../../controllers/userDatabaseDynamo.js';
import app from '../../../app.js';
import todaysDateFunc from '../../../utils/easeOfUseFunc.js';
import { addToList, generateAccessToken } from '../../../utils/authUtils.js';
import { addTokenToTable, findResetUniqueCode } from '../../../controllers/userTokenDynamo.js';
import { sendEmail } from '../../../utils/sendEmail.js';

const uuidv4 = require('uuid').v4;

const chance = new Chance();

jest.mock('../../../utils/authUtils.js', () => ({
  addToList: jest.fn(),
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

jest.mock('../../../controllers/userTokenDynamo.js', () => ({
  addTokenToTable: jest.fn(),
  findResetUniqueCode: jest.fn(),
}));

jest.mock('../../../controllers/userDatabaseDynamo.js', () => ({
  findOneUserName: jest.fn(),
  findOneUserByEmail: jest.fn(),
  addUserToUserDatabase: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compareSync: jest.fn(),
  hashSync: jest.fn(() => 'hashedPassword'),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
}));

jest.mock('../../../utils/sendEmail.js', () => ({ sendEmail: jest.fn() }));

const mockUsername = chance.string({ length: 8, casing: 'upper', alpha: true });
const mockEmail = chance.email({ domain: 'speebaboon.com' });

describe('basic router checks', () => {
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

  it('responds with 404 and error message for non-existent route', async () => {
    expect.assertions(2);
    try {
      await axios.get(`${baseURL}/api/v2/skibbitytoilet`);
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe('Route not found');
    }
  });

  it('throws error when server is down', async () => {
    try {
      await axios.get(`${baseURL}/api/v2/public/error`);
    } catch (error) {
      expect(error.response.status).toBe(500);
      expect(error).toBeTruthy();
    }
  });
});

describe('check the /public/auth/login endpoint', () => {
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
  it('/public/auth/login - does not allow GET, PUT, DELETE requests', async () => {
    const methods = ['get', 'put', 'delete'];
    expect.assertions(methods.length);

    // eslint-disable-next-line no-restricted-syntax
    for (const method of methods) {
      try {
        const dataForMock = {
          Items: [{ username: 'existingUser' }],
          Count: 1,
          ScannedCount: 1,
        };
        findOneUserName.mockResolvedValue(dataForMock);
        // eslint-disable-next-line no-await-in-loop
        await axios[method](`${baseURL}/api/v2/public/auth/login`);

        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(405);
      }
    }
  });

  // test that returns 400 if username is less than 3 characters
  it('/public/auth/login - returns 400 if username is less than 3 characters', async () => {
    expect.assertions(1);
    try {
      const dataForMock = {
        Items: [{ username: 'existingUser' }],
        Count: 1,
        ScannedCount: 1,
      };
      findOneUserName.mockResolvedValue(dataForMock);
      addToList.mockResolvedValue(true);
      bcrypt.compareSync.mockReturnValue(true);
      addUserToUserDatabase.mockResolvedValue();

      await axios.post(`${baseURL}/api/v2/public/auth/login`, {
        username: chance.string({ length: 2, casing: 'upper', alpha: true }),
        password: 'password',
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/login - returns 400 if username is greater than 30 characters', async () => {
    expect.assertions(1);

    try {
      const dataForMock = {
        Items: [{ username: 'existingUser' }],
        Count: 1,
        ScannedCount: 1,
      };
      findOneUserName.mockResolvedValue(dataForMock);
      addToList.mockResolvedValue(true);
      bcrypt.compareSync.mockReturnValue(true);

      await axios.post(`${baseURL}/api/v2/public/auth/login`, {
        username: chance.string({ length: 32, casing: 'upper', alpha: true }),
        password: 'password',
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/login - returns two cookies if successfull', async () => {
    expect.assertions(5);

    try {
      const dataForMock = {
        Items: [{ username: 'existingUser' }],
        Count: 1,
        ScannedCount: 1,
      };
      findOneUserName.mockResolvedValue(dataForMock);
      addToList.mockResolvedValue(true);
      bcrypt.compareSync.mockReturnValue(true);

      const response = await axios.post(`${baseURL}/api/v2/public/auth/login`, {
        username: 'username',
        password: 'password',
      });

      expect(response.status).toEqual(200);
      const cookies = response.headers['set-cookie'];

      expect(cookies).toBeDefined();
      expect(cookies.length).toEqual(2);
      const cookieNames = cookies.map((cookie) => cookie.split(';')[0].split('=')[0]);
      expect(cookieNames).toContain('_baboon_act');
      expect(cookieNames).toContain('_baboon_rt');
      // make sure the test fails if the above request does not throw an error
    } catch {
      expect(true).toBe(false);
    }
  });
  it("/public/auth/login - returns 400 if user doesn't exists", async () => {
    expect.assertions(1);

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
        username: 'existingUser',
        password: 'password',
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/login - returns true if the password is valid', async () => {
    expect.assertions(2);

    try {
      findOneUserName.mockResolvedValue({
        Count: 1,
        Items: [{ password: 'hashedPassword' }],
      });
      bcrypt.compareSync.mockReturnValue(true);
      generateAccessToken.mockReturnValue(true);
      addToList.mockResolvedValue(false);

      const password = 'password';
      const hashPassword = 'hashedPassword';

      const validPassword = bcrypt.compareSync(password, hashPassword);

      const response = await axios.post(`${baseURL}/api/v2/public/auth/login`, {
        username: 'existingUser',
        password: 'password1',
      });
      expect(validPassword).toBe(true);
      expect(response.status).toBe(200);
    } catch {
      expect(true).toBe(false);
    }
  });

  it('/public/auth/login - returns 400 if the bcrypt password is invalid', async () => {
    expect.assertions(1);

    try {
      findOneUserName.mockResolvedValue({
        Count: 1,
        Items: [{ password: 'hashedPassword' }],
      });
      bcrypt.compareSync.mockReturnValue(false);

      await axios.post(`${baseURL}/api/v2/public/auth/login`, {
        username: 'existingUser',
        password: 'password1',
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
});

describe('check the /public/auth/register endpoint', () => {
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

  it('/public/auth/register - returns 400 if username has less than 3 character', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: '12',
        password: 'ThisIsAValidPassword11!',
        email: 'testbaboon@babby.com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if username has more than 30 character', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'ThisIsAInvalidUsernameThatIsMoreThanThirtyCharactersLong',
        password: 'ThisIsAValidPassword11!',
        email: 'testbaboon@babby.com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if password has less than 8 characters', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'validUsername',
        password: '2Short!',
        email: 'testbaboon@babby.com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if password has more than 32 characters', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'validUsername',
        password: 'ThisIsAInvalidPasswordThatIsMoreThanThirtyTwoCharactersLong!',
        email: 'testbaboon@babby.com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if password does not have one lowercase', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'validUsername',
        password: 'INVALIDPASSWORD11!',
        email: 'testbaboon@babby.com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if password does not have one uppercase', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'validUsername',
        password: 'invalidpassword11!',
        email: 'testbaboon@babby.com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if password does not have one number', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'validUsername',
        password: 'InvalidPassword!',
        email: 'testbaboon@babby.com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if password does not have one special character', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'validUsername',
        password: 'InvalidPassword1',
        email: 'testbaboon@babby.com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if username is not in payload', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        password: 'ValidPassword11!',
        email: 'testbaboon@babby.com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if password is not in payload', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'validUsername',
        email: 'testbaboon@babby.com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if email is not in payload', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'validUsername',
        password: 'ValidPassword11!',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if email is not a valid email', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'validUsername',
        password: 'ValidPassword11!',
        email: 'baboon@com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if email is not an empty email', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'validUsername',
        password: 'ValidPassword11!',
        email: '',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if username already exists', async () => {
    expect.assertions(1);

    findOneUserName.mockResolvedValue({
      Count: 1,
      Items: [
        {
          dateCreated: '2022-12-12',
          password: '$2b$12$7mpBSOKHrasdfasdfasdfaW',
          username: 'validUsername',
          isAdmin: false,
          email: 'validemail@discbaboons.com',
          id: '55723813-50bb-4f5b-93ed-7a03asdfa9fa',
        },
      ],
      ScannedCount: 1,
    });

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'validUsername',
        password: 'ValidPassword11!',
        email: 'validemail@discbaboons.com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - returns 400 if email already exists', async () => {
    expect.assertions(1);
    findOneUserName.mockResolvedValue({
      Count: 0,
      Items: [],
      ScannedCount: 0,
    });

    findOneUserByEmail.mockResolvedValue({
      Count: 1,
      Items: [
        {
          dateCreated: '2022-12-12',
          password: '$2b$12$7mpBSOKHrasdfasdfasdfaW',
          username: 'newUsername',
          isAdmin: false,
          email: 'alreadytakenemail@discbaboons.com',
          id: '55723813-50bb-4f5b-93ed-7a03asdfa9fa',
        },
      ],
      ScannedCount: 1,
    });

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: 'validUsername',
        password: 'ValidPassword11!',
        email: 'validemail@discbaboons.com',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/public/auth/register - main user payload returns correctly', async () => {
    expect.assertions(1);
    findOneUserName.mockResolvedValue({
      Count: 0,
      Items: [],
      ScannedCount: 0,
    });

    findOneUserByEmail.mockResolvedValue({
      Count: 0,
      Items: [
        {
          Count: 0,
          Items: [],
          ScannedCount: 0,
        },
      ],
      ScannedCount: 0,
    });
    addUserToUserDatabase.mockResolvedValue();

    try {
      const response = await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: mockUsername,
        password: 'ValidPassword11!',
        email: mockEmail,
      });

      const userPayload = response.data.user;

      const expectedPayload = {
        id: uuidv4(),
        username: mockUsername.toLowerCase(),
        email: mockEmail,
        dateCreated: todaysDateFunc(),
      };

      expect(userPayload).toEqual(expectedPayload);
    } catch {
      expect(true).toBe(false);
    }
  });
  it('/public/auth/register - should return 500 if addUserToUserDatabase fails', async () => {
    expect.assertions(1);
    findOneUserName.mockResolvedValue({
      Count: 0,
      Items: [],
      ScannedCount: 0,
    });

    findOneUserByEmail.mockResolvedValue({
      Count: 0,
      Items: [
        {
          Count: 0,
          Items: [],
          ScannedCount: 0,
        },
      ],
      ScannedCount: 0,
    });
    addUserToUserDatabase.mockRejectedValue(new Error('Error adding user to database'));

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: mockUsername,
        password: 'ValidPassword11!',
        email: mockEmail,
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });
  it('/public/auth/register - should return two cookies if everything succeeds', async () => {
    expect.assertions(6);
    findOneUserName.mockResolvedValue({
      Count: 0,
      Items: [],
      ScannedCount: 0,
    });

    findOneUserByEmail.mockResolvedValue({
      Count: 0,
      Items: [
        {
          Count: 0,
          Items: [],
          ScannedCount: 0,
        },
      ],
      ScannedCount: 0,
    });
    addUserToUserDatabase.mockResolvedValue();

    try {
      const response = await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: mockUsername,
        password: 'ValidPassword11!',
        email: mockEmail,
      });

      expect(response.status).toEqual(200);
      const cookies = response.headers['set-cookie'];

      expect(cookies).toBeDefined();
      expect(cookies.length).toEqual(2);
      const cookieNames = cookies.map((cookie) => cookie.split(';')[0].split('=')[0]);
      expect(cookieNames).toContain('_baboon_act');
      expect(cookieNames).toContain('_baboon_rt');
      expect(response.data.cookieSet).toBe(true);
    } catch {
      expect(true).toBe(false);
    }
  });
  it('/public/auth/register - should return 200 even if cookies fail to generate or add refresh token to database', async () => {
    // expect.assertions(5);
    findOneUserName.mockResolvedValue({
      Count: 0,
      Items: [],
      ScannedCount: 0,
    });

    findOneUserByEmail.mockResolvedValue({
      Count: 0,
      Items: [
        {
          Count: 0,
          Items: [],
          ScannedCount: 0,
        },
      ],
      ScannedCount: 0,
    });
    addUserToUserDatabase.mockReturnValue(true);
    addToList.mockRejectedValue(new Error('Error adding refresh token to database'));

    try {
      const response = await axios.post(`${baseURL}/api/v2/public/auth/register`, {
        username: mockUsername,
        password: 'ValidPassword11!',
        email: mockEmail,
      });

      const cookies = response.headers['set-cookie'];

      expect(cookies).not.toBeDefined();
      expect(response.status).toEqual(200);
      expect(response.data.cookieSet).toBe(false);
    } catch {
      expect(true).toBe(false);
    }
  });
});

describe('check the /public/auth/forgotuser endpoint', () => {
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

  it("/public/auth/forgotuser - returns 400 if email isn't in payload", async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/forgotuser`, {
        notemail: 'notemail',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it("/public/auth/forgotuser - doesn't send email if email isn't in payload", async () => {
    expect.assertions(2);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/forgotuser`, {
        notemail: 'notemail',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(sendEmail).not.toHaveBeenCalled();
      expect(error.response.status).toBe(400);
    }
  });

  it("/public/auth/forgotuser - returns 200 even if email doesn't exist", async () => {
    expect.assertions(1);

    findOneUserByEmail.mockResolvedValue({
      Count: 0,
      Items: [],
      ScannedCount: 0,
    });

    try {
      const response = await axios.post(`${baseURL}/api/v2/public/auth/forgotuser`, {
        email: 'email@email.com',
      });
      expect(response.status).toBe(200);
    } catch (error) {
      expect(true).toBe(false);
    }
  });

  it("/public/auth/forgotuser - doesn't sent email if email doesn't exist", async () => {
    expect.assertions(1);

    findOneUserByEmail.mockResolvedValue({
      Count: 0,
      Items: [],
      ScannedCount: 0,
    });

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/forgotuser`, {
        email: 'email@email.com',
      });

      expect(sendEmail).not.toHaveBeenCalled();
    } catch (error) {
      expect(true).toBe(false);
    }
  });

  it("/public/auth/forgotuser - returns 200 even if email doesn't exist", async () => {
    expect.assertions(1);

    findOneUserByEmail.mockResolvedValue({
      Count: 0,
      Items: [],
      ScannedCount: 0,
    });

    sendEmail.mockResolvedValue(true);

    try {
      const response = await axios.post(`${baseURL}/api/v2/public/auth/forgotuser`, {
        email: 'fakeemail@email.com',
      });
      expect(response.status).toBe(200);
    } catch {
      expect(true).toBe(false);
    }
  });

  it("/public/auth/forgotuser - returns 500 even if email doesn't send correctly", async () => {
    expect.assertions(1);

    findOneUserByEmail.mockResolvedValue({
      Count: 1,
      Items: [
        {
          dateCreated: '2022-12-12',
          password: '$2b$12$7mpBSOKHrasdfasdfasdfaW',
          username: 'newUsername',
          isAdmin: false,
          email: 'alreadytakenemail@discbaboons.com',
          id: '55723813-50bb-4f5b-93ed-7a03asdfa9fa',
        },
      ],
      ScannedCount: 1,
    });

    sendEmail.mockResolvedValue(false);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/forgotuser`, {
        email: 'fakeemail@email.com',
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });

  it("/public/auth/forgotuser - returns 400 even if email isn't right format", async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/forgotuser`, {
        email: 'fakeemailemailcom',
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
});

describe('check the /public/auth/forgotpassword endpoint', () => {
  let server;
  let baseURL;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
    baseURL = `http://localhost:${server.address().port}`;
    sendEmail.mockClear();
  });

  afterAll((done) => {
    server.close(done);
  });

  it("/public/auth/forgotpassword - returns 400 if username isn't in payload", async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/forgotpassword`, {
        notusername: 'notemail',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('/public/auth/forgotpassword - returns 400 if username is less than 3 characters', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/forgotpassword`, {
        username: 'ab',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('/public/auth/forgotpassword - returns 400 if username is more than 30 characters', async () => {
    expect.assertions(1);

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/forgotpassword`, {
        username: 'ThisIsAUsernameThatIsMoreThanThirtyCharactersLong',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('/public/auth/forgotpassword - returns 200 if no username is found', async () => {
    expect.assertions(1);

    const dataForMock = {
      Items: [],
      Count: 0,
      ScannedCount: 0,
    };

    findOneUserName.mockResolvedValue(dataForMock);

    try {
      const response = await axios.post(`${baseURL}/api/v2/public/auth/forgotpassword`, {
        username: 'username',
      });
      expect(response.status).toBe(200);
    } catch {
      expect(true).toBe(false);
    }
  });

  it('/public/auth/forgotpassword - if username exists, emailSend is called, addToken is called, 200 is returned', async () => {
    expect.assertions(3);

    try {
      findOneUserName.mockResolvedValue({
        Items: [{ username: 'existingUser' }],
        Count: 1,
        ScannedCount: 1,
      });

      sendEmail.mockResolvedValue(true);
      addTokenToTable.mockResolvedValue();

      const response = await axios.post(`${baseURL}/api/v2/public/auth/forgotpassword`, {
        username: 'testuser',
      });
      expect(sendEmail).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(addTokenToTable).toHaveBeenCalled();
    } catch {
      expect(true).toBe(false);
    }
  });

  it('/public/auth/forgotpassword - returns 500 if email does not send properly', async () => {
    expect.assertions(1);

    try {
      findOneUserName.mockResolvedValue({
        Items: [{ username: 'existingUser' }],
        Count: 1,
        ScannedCount: 1,
      });

      addTokenToTable.mockResolvedValue();
      sendEmail.mockResolvedValue(false);

      await axios.post(`${baseURL}/api/v2/public/auth/forgotpassword`, {
        username: 'testuser',
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });
});

describe('check the /public/auth/validatereset endpoint', () => {
  let server;
  let baseURL;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
    baseURL = `http://localhost:${server.address().port}`;
    sendEmail.mockClear();
  });

  afterAll((done) => {
    server.close(done);
  });

  it('/public/auth/validatereset - returns 404 if findreset count is 0', async () => {
    expect.assertions(1);

    findResetUniqueCode.mockResolvedValue({
      Items: [],
      Count: 0,
      ScannedCount: 0,
    });

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/validatereset`, {
        code: 12345,
        requestUUID: 'mockedRequestUUID',
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });

  it('/public/auth/validatereset - returns 200 if findreset count is 1', async () => {
    expect.assertions(1);

    findResetUniqueCode.mockResolvedValue({
      Items: [{ uniqueCode: 12345 }],
      Count: 1,
      ScannedCount: 1,
    });

    try {
      const response = await axios.post(`${baseURL}/api/v2/public/auth/validatereset`, {
        code: 12345,
        requestUUID: 'mockedRequestUUID',
      });
      expect(response.status).toBe(200);
    } catch {
      expect(true).toBe(false);
    }
  });

  it('/public/auth/validatereset - returns 400 if code is missing from payload', async () => {
    expect.assertions(1);

    // findResetUniqueCode.mockResolvedValue({
    //   Items: [{ uniqueCode: 12345 }],
    //   Count: 1,
    //   ScannedCount: 1,
    // });

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/validatereset`, {
        requestUUID: 'mockedRequestUUID',
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('/public/auth/validatereset - returns 400 if requestUUID is missing from payload', async () => {
    expect.assertions(1);

    // findResetUniqueCode.mockResolvedValue({
    //   Items: [{ uniqueCode: 12345 }],
    //   Count: 1,
    //   ScannedCount: 1,
    // });

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/validatereset`, {
        code: 1234,
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('/public/auth/validatereset - returns 400 if code is a string', async () => {
    expect.assertions(1);

    // findResetUniqueCode.mockResolvedValue({
    //   Items: [{ uniqueCode: 12345 }],
    //   Count: 1,
    //   ScannedCount: 1,
    // });

    try {
      await axios.post(`${baseURL}/api/v2/public/auth/validatereset`, {
        code: 'notanumber1234',
        requestUUID: 'mockedRequestUUID',
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
});

describe('check the /public/auth/changepass endpoint', () => {
  let server;
  let baseURL;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
    baseURL = `http://localhost:${server.address().port}`;
    sendEmail.mockClear();
  });

  afterAll((done) => {
    server.close(done);
  });

  it('/public/auth/changepass - returns 405 if type is not POST', async () => {
    const methods = ['get', 'put', 'delete'];
    expect.assertions(methods.length);

    // eslint-disable-next-line no-restricted-syntax
    for (const method of methods) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await axios[method](`${baseURL}/api/v2/public/auth/changepass`);

        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(405);
      }
    }
  });

  it("/public/auth/changepass -  returns 400 if 'requestUUID' is missing", async () => {
    try {
      await axios.post(`${baseURL}/api/v2/public/auth/changepass`, {
        code: 12345,
        newPassword: 'newPassword',
      });
      expect(true).toBe(false); // Fail test if the above line does not throw
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it("/public/auth/changepass - returns 400 if 'code' is missing", async () => {
    try {
      await axios.post(`${baseURL}/api/v2/public/auth/changepass`, {
        newPassword: 'newPassword',
        requestUUID: 'mockedRequestUUID',
      });
      expect(true).toBe(false); // Fail test if the above line does not throw
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it("/public/auth/changepass - returns 400 if 'newPassword' is missing", async () => {
    try {
      await axios.post(`${baseURL}/api/v2/public/auth/changepass`, {
        code: 12345,
        requestUUID: 'mockedRequestUUID',
      });
      expect(true).toBe(false); // Fail test if the above line does not throw
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it("/public/auth/changepass - returns 200 if 'code' is correct", async () => {
    try {
      findResetUniqueCode.mockResolvedValue({
        Items: [{ uniqueCode: 123456, username: 'testuser' }],
        Count: 1,
        ScannedCount: 1,
      });

      const response = await axios.post(`${baseURL}/api/v2/public/auth/changepass`, {
        code: 123456,
        requestUUID: 'mockedRequestUUID',
        newPassword: 'newPassword',
      });
      expect(response.status).toBe(200);
    } catch {
      expect(true).toBe(false); // Fail test if the above line does not throw
    }
  });

  it("/public/auth/changepass - returns 404 if 'code' is incorrect", async () => {
    try {
      findResetUniqueCode.mockResolvedValue({
        Items: [{ uniqueCode: 123456, username: 'testuser' }],
        Count: 1,
        ScannedCount: 1,
      });

      await axios.post(`${baseURL}/api/v2/public/auth/changepass`, {
        code: 123457,
        requestUUID: 'mockedRequestUUID',
        newPassword: 'newPassword',
      });
      expect(true).toBe(false); // Fail test if the above line does not throw
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });
});
