const nodemailer = require("nodemailer");
const { cfg } = require("../config/env");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: cfg.SMTP_USERNAME,
    pass: cfg.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

  const emailNodmailer =async(emailData)=>{
    try{
      
        const mailOptions ={
            from: cfg.SMTP_USERNAME,
            to: emailData.email,
            subject: emailData.subject,
            text: emailData.text || emailData.html.replace(/<[^>]+>/g, ""), // fallback
            html: emailData.html, // html body
        }
        await transporter.sendMail(mailOptions);
    }catch(error){
        console.error("error occured while sending email: ",error);
        throw error
    }
  }

  module.exports = emailNodmailer