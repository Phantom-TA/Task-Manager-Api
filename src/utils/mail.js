import Mailgen from  "mailgen";
import nodemailer from "nodemailer";

const sendMail = async (options) => {
      const mailGenerator = new Mailgen({
      theme: "default",
      product:{
          name: "Task Manager",
          link: "https://taskmanager.com",
      },

    })

    var emailText = mailGenerator.generatePlaintext(options.mailgenContent);

    var emailHtml = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({    
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false ,// true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mail ={ 
        from: 'mail.taskmanager@example.com',
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHtml,
    }

    try {
        await transporter.sendMail(mail);
        return {success : true};
    } catch (error) {
        console.error("Error sending email:", error);
        return {success : false, error: error.message};
    }
}

const emailVerificationMailGenContent = ( username ,
     verificationurl) =>{
         return {
            body:{
                name: username,
                intro: "Welcome to Task Manager! We're excited to have you on board.",
                action: {
                    instructions: "To complete your registration, please verify your email address by clicking the button below.",
                    button: {
                        color: "#22BC66", // Optional action button color
                        text: "Verify Email",
                        link: verificationurl,
                    },
                },
                outro : "Need help, or have questions? Just reply to this email, we\'d love to help.",
            }
         }
}
const forgotPasswordMailGenContent = ( username ,
     passwordResetUrl) =>{
         return {
            body:{
                name: username,
                intro: "We received a request to reset your password for your Task Manager account.",
                action: {
                    instructions: "To reset your password , click the button below.",
                    button: {
                        color: "#22BC66", // Optional action button color
                        text: "Reset Password",
                        link: passwordResetUrl,
                    },
                },
                outro : "Need help, or have questions? Just reply to this email, we\'d love to help.",
            }
         }
}
export {sendMail, emailVerificationMailGenContent, forgotPasswordMailGenContent};