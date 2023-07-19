const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config();
const env = process.env;

router.post('/sendMail', async (req, res) => {
  const { email } = req.body;
  let code = Math.random().toString(36).substr(2, 6); //매번 다른 6자리의 숫자+알파벳으로 이루어져있는 난수 생성

  const expire_time = Date.now() + 1000 * 60 * 3;

  const service_name = 'Pet-Service';
  const mailSubject = `[${service_name}] 회원가입 이메일 인증코드가 도착했습니다`;
  const mailBody = `<p>이메일 인증코드는 ${code} 입니다.</p>
                    <p>이 코드는 3분 후 만료됩니다.</p>`;

  const success = () => {
    return res.status(200).json({ message: '메시지 전송에 성공했습니다.', code, expire_time });
  };
  const fail = () => {
    return res.status(500).json({ errorMessage: '메시지 전송에 실패했습니다.' });
  };

  sendEmail(service_name, email, mailSubject, mailBody, success, fail);
});

const sendEmail = (fromServiceName, toEmail, toMailSubject, toMailBody, success, fail) => {
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PWD,
    },
  });

  let mail_from =
    fromServiceName === undefined ? env.EMAIL_USER : fromServiceName + '<' + env.EMAIL_USER + '>';

  let mailOptions = {
    from: mail_from,
    to: toEmail,
    subject: toMailSubject,
    html: toMailBody,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      fail();
    } else {
      console.log(info.response);
      success();
    }
    transporter.close();
  });
};

module.exports = router;
