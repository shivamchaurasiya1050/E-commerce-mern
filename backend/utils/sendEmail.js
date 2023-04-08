const nodeMailer= require("nodemailer");
const SMPT_SERVICE =process.env.SMPT_SERVICE|| "gmail"
const SMPT_MAIL =process.env.SMPT_MAIL|| "shivamchaurasiya1@gmail.com"
const SMPT_PASSWORD =process.env.SMPT_PASSWORD||"shivam123"

const sendEmail= async (options)=>{

    const transporter= nodeMailer.createTransport({
        host:"smpt.gmail.com",
        port:465,
        service:SMPT_SERVICE,
        auth: {
            user:SMPT_MAIL,
            pass:SMPT_PASSWORD,
        },
        
    });
    const mailOptions ={
            from:SMPT_MAIL,
            to:options.email,
            subject:options.subject,
            text:options.message,
    };
    await transporter.sendMail(mailOptions);
};
module.exports=sendEmail;