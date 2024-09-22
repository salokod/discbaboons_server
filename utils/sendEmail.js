import nodemailer from 'nodemailer';

export const sendEmail = async (subject, body, htmlBody, recipient) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: true,
      service: 'Outlook365',
      auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASS,
      },
    });

    await transporter.sendMail({
      from: '"Baboon Spiro" <spiro@discbaboons.com>', // sender address
      to: recipient, // list of receivers
      subject, // Subject line
      text: body, // plain text body
      html: htmlBody, // html body
    });

    return true;
  } catch {
    return false;
  }
};
