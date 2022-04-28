import sgMail from "@sendgrid/mail";

const sendEmail = async (options) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: options.email, // Change to your recipient
    from: process.env.SMTP_FROM, // Change to your verified sender
    subject: options.subject,
    text: options.message,
    html: options.htmlMessage,
  };

  await sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.log(error.message);
      console.error(error);
    });
};

export default sendEmail;
