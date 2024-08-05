import nodemailer from 'nodemailer';
import { expect, describe } from '@jest/globals';
import { sendEmail } from '../../utils/sendEmail';

// Mock nodemailer
jest.mock('nodemailer');

const sendMailMock = jest.fn();
nodemailer.createTransport.mockReturnValue({
  sendMail: sendMailMock,
});

describe('sendEmail', () => {
  beforeEach(() => {
    sendMailMock.mockClear();
  });

  it('should send an email successfully', async () => {
    sendMailMock.mockResolvedValue(true);

    const result = await sendEmail('Test Subject', 'Test Body', '<p>Test Body</p>', 'test@example.com');

    expect(result).toBe(true);
    expect(sendMailMock).toHaveBeenCalledWith({
      from: '"Baboon Spiro" <spiro@discbaboons.com>',
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test Body',
      html: '<p>Test Body</p>',
    });
  });

  it('should handle errors when sending an email fails', async () => {
    sendMailMock.mockRejectedValue(new Error('Failed to send email'));

    const result = await sendEmail('Test Subject', 'Test Body', '<p>Test Body</p>', 'test@example.com');

    expect(result).toBe(false);
  });
});
