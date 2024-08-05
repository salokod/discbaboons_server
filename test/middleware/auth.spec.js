import jwt from 'jsonwebtoken';
import {
  expect, describe, it, beforeEach, jest,
} from '@jest/globals';
import { isAuthenticated } from '../../middleware/auth';

jest.mock('jsonwebtoken');

describe('isAuthenticated middleware', () => {
  let req; let res; let
    next;

  beforeEach(() => {
    req = { body: { token: 'testToken' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next if token is valid', () => {
    jwt.verify.mockReturnValue({ id: 'testUser' });

    isAuthenticated(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('testToken', process.env.SECRET_TOKEN);
    expect(req.jwt).toEqual({ id: 'testUser' });
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    isAuthenticated(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('testToken', process.env.SECRET_TOKEN);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
