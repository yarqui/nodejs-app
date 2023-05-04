require("dotenv").config();
const sgMail = require("@sendgrid/mail");
// const nodemailer = require("nodemailer");
const { SENDGRID_API_KEY, ZL_PASSWORD, SG_EMAIL_SENDER, ZL_EMAIL_SENDER } =
  process.env;

const testDataToSend = {
  to: "y.pelykh@gmail.com",
  subject: "🔴HAL: I'm sorry, Dave. I'm afraid I can't do that.",
  html: "<strong>Just what do you think you're doing, Dave?</strong>",
};

sgMail.setApiKey(SENDGRID_API_KEY);
const sendSgEmail = async (data) => {
  // data is 'to', 'subject', 'html', 'text' etc.
  const message = { ...data, from: SG_EMAIL_SENDER };
  await sgMail.send(message);

  // we return true, if the error occurs, controller will handle it
  return true;
};

// const sendNodemailerEmail = (data) => {
//   const config = {
//     host: "mail.adm.tools",
//     port: 465,
//     secure: true,
//     auth: {
//       user: ZL_EMAIL_SENDER,
//       pass: ZL_PASSWORD,
//     },
//   };
//   // creates transporter with configuration
//   const transporter = nodemailer.createTransport(config);
//   const message = { ...data, from: ZL_EMAIL_SENDER };
//   transporter.sendMail(message);

//   return true;
// };

sendSgEmail(testDataToSend);
sendNodemailerEmail(testDataToSend);

module.exports = { sendSgEmail };
