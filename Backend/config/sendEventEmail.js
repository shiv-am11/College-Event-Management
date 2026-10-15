const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEventEmail = async (students, event) => {
  if (!students.length) {
    console.log("No students found for email notification.");
    return;
  }

  const recipients = students
    .map((student) => student.email)
    .filter(Boolean);

  if (!recipients.length) {
    console.log("No valid student email addresses found.");
    return;
  }

  const mailOptions = {
    from: `"CampusHub" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    bcc: recipients,
    subject: `New Campus Event: ${event.title}`,
    text: `
Hello Student,

A new event has been created for your department on CampusHub!

Event: ${event.title}
Date: ${new Date(event.date).toLocaleDateString("en-IN")}
Time: ${event.time || "Not specified"}
Venue: ${event.venue || "Not specified"}

Description:
${event.description || "No description provided."}

Please log in to CampusHub to view the event and register.

Regards,
CampusHub Team
    `.trim(),
  };

  const info = await transporter.sendMail(mailOptions);

  console.log(
    `Event notification submitted to email service. Message ID: ${info.messageId}`
  );
};
transporter.verify()
  .then(() => console.log("Gmail SMTP connection successful"))
  .catch((err) => console.error("Gmail SMTP error:", err.message));

module.exports = sendEventEmail;