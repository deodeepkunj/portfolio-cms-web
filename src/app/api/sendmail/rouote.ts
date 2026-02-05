// pages/api/contact.js

import nodemailer from 'nodemailer';

export default async function sendMail(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { name, email, message, subject } = req.body;

  // Ensure all fields are provided
  if (!name || !email || !message || !subject) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Create the transporter for sending emails
    let transporter = nodemailer.createTransport({
      service: 'Gmail', // Or another email provider like SendGrid
      auth: {
        user: process.env.SMTP_USER, // Your email address
        pass: process.env.SMTP_PASS, // Your email password or app password
      },
    });

    // Send the email
    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`, // Your email, but with the user's name as the display name
      replyTo: email, // User's email (so you can reply directly to them)
      to: process.env.SMTP_USER, // Your email to receive the message
      subject: subject, // Subject line
      text: message, // Plain text body
      html: `<p>You have a new contact form submission</p>
             <p><strong>Name: </strong>${name}</p>
             <p><strong>Email: </strong>${email}</p>
              <p><strong>Subject: </strong>${subject}</p>
             <p><strong>Message: </strong>${message}</p>`, // HTML version of the message
    });

    return res.status(200).json({ message: 'Email sent successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to send email', error });
  }
}

function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
