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
      secure: true, // Use of SSL
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
      logger: true, // Active les logs détaillés
      debug: true,  
      tls: {
        rejectUnauthorized: false, // Ignore invalid or self-signed certificates
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.log("Error during SMTP verification :", error);
      } else {
        console.log("The SMTP server is ready to send messages" , success);
      }
    });
    
  
    let mailOptions = {
      from: `"${lastName}" <${email}>`,
      to: process.env.MAILTRAP_TO, 
      subject: `New contact message by ${lastName}`,
      text: ` 
        LastName: ${lastName} 
        FirstName: ${firstName || 'N/A'} 
        Company: ${company || 'N/A'} 
        Phone: ${phone || 'N/A'} 

        ${message} 
      `
    };
  
    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ result: true, success: 'Email sent successfully', message: mailOptions });
    } catch (error) {
      console.error('Error details:', error); // Log full error
      return res.status(500).json({ result: false, error: 'Failed to send email', details: error.message });
    }
  } else {
    res.json({ result: false, error: 'Email is not valid' });
    return;
  }

});

module.exports = router;