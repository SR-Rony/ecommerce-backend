const nodemailer = require("nodemailer");
const { smtpUserName, smtpPassword } = require("../secrit");


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: smtpUserName,
      pass: smtpPassword
    },
  });

  const emailNodmailer =async(emailData)=>{
    try{
      
        const mailOptions ={
            from: smtpUserName, // sender address
            to: emailData.email, // list of receivers
            subject: emailData.subject, // Subject line
            html: emailData.html, // html body
        }
        await transporter.sendMail(mailOptions);
    }catch(error){
        console.error("error occured while sending email: ",error);
        throw error
    }
  }

  module.exports = emailNodmailer