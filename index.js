require('dotenv').config();
const nodemailer = require('nodemailer');
const csv=require('csvtojson')
const fs= require('fs');

const smtpUsername= process.env.SMTP_USERNAME;
const smtpPassword= process.env.SMTP_PASSWORD;
const smtpEndpoint= process.env.SMTP_SERVER;
const senderAddress= process.env.SENDER_ADDRESS;
const toAddressesFile= process.env.TOADDRESS_FILE+".csv";
const email_contentFile= process.env.HTML_CONTENT_FILE+".html";
const subject= process.env.EMAIL_SUBJECT;
let emailHtmlContent="";
const port = process.env.PORT;

let transporter=null;

const readAddressFile = ()=>{
    csv()
    .fromFile(toAddressesFile)
    .then((json)=>{
        json.forEach(data=>{
            createMailOption(data);
        })
    })
}

const createMailOption = (identity) =>{
    let mailOptions = {
        from: senderAddress,
        to: identity.email,
        subject: subject,
        text: ``,
        html: emailHtmlContent
      };
      sendEmail(mailOptions);
}

const createConnection = () =>{
    transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: false,
        auth: {
          user: smtpUsername,
          pass: smtpPassword
        }
    });
}

const sendEmail = (mailOptions) =>{
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ', info.response);
        }
    });
}

fs.readFile(email_contentFile, "utf-8",function(err, data) {
    if(err){
        console.log("Error while reading html file: ", err);
    }else{
        emailHtmlContent= data;
        createConnection();
        readAddressFile();
    }
});