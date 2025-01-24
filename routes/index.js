var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
const { checkBody } = require('../modules/checkBody');

/* GET home page. */
router.post('/send_email', async (req, res) => {
  if (!checkBody(req.body, ['lastName', 'email', 'message'])) {
    res.json({ result: false, error: 'Missing or empty fields' })
    return;
  }

  const { lastName, firstName, email, company, phone, message } = req.body;

  const patternMail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const emailCheck = patternMail.test(email);

  if (emailCheck) {
    let transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      }
    });
  
    let mailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: process.env.MAILTRAP_TO, 
      subject: `New contact message by ${email}`,
      text: ` 
        LastName: ${lastName} 
        FirstName: ${firstName} 
        Email: ${email} 
        Company: ${company} 
        Phone: ${phone} 
        Message: ${message} 
      `
    };
  
    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ result: true, success: 'Email sent successfully', message: mailOptions });
    } catch (error) {
      return res.status(500).json({ result: false, error: 'Failed to send email' });
    }
  } else {
    res.json({ result: false, error: 'Email is not valid' });
    return;
  }

});

module.exports = router;